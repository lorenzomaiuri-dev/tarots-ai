import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { CardFlip } from './CardFlip';
import { Spread, DrawnCard } from '../types/reading';
import { useTranslation } from 'react-i18next';

// Configuration for visual sizing
const CARD_WIDTH = 110;
const CARD_HEIGHT = 185;
const GUTTER = 25;

interface Props {
  spread: Spread;
  deckId: string;
  drawnCards: DrawnCard[];
  onSlotPress: (slotId: string) => void;
}

export const SpreadVisualizer: React.FC<Props> = ({ 
  spread, 
  deckId, 
  drawnCards, 
  onSlotPress 
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // 1. Calculate Canvas Size
  let maxX = 0;
  let maxY = 0;

  spread.slots.forEach(slot => {
    if (slot.layout) {
      if (slot.layout.x > maxX) maxX = slot.layout.x;
      if (slot.layout.y > maxY) maxY = slot.layout.y;
    }
  });

  // Calculate total canvas dimensions
  const canvasWidth = (maxX + 1) * (CARD_WIDTH + GUTTER) + GUTTER * 2;
  const canvasHeight = (maxY + 1) * (CARD_HEIGHT + GUTTER) + GUTTER * 4;

  return (
    <ScrollView 
      horizontal 
      contentContainerStyle={{ width: Math.max(canvasWidth, Dimensions.get('window').width) }}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
    >
      <ScrollView 
        contentContainerStyle={{ height: Math.max(canvasHeight, 600) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tableMat, { width: canvasWidth, height: canvasHeight }]}>
          
          {spread.slots.map((slot, index) => {
            const layout = slot.layout || { x: 0, y: 0 };
            const drawn = drawnCards.find(c => c.positionId === slot.id);
            
            // Calculate absolute position
            const top = layout.y * (CARD_HEIGHT + GUTTER) + (GUTTER * 2);
            const left = layout.x * (CARD_WIDTH + GUTTER) + GUTTER;

            const rotation = layout.rotation || 0;
            const isRotated = rotation !== 0;
            const zIndex = (layout.zIndex ?? index) + 10;

            return (
              <View 
                key={slot.id} 
                pointerEvents="box-none"
                style={[
                  styles.slotContainer, 
                  { top, left, width: CARD_WIDTH, height: CARD_HEIGHT, zIndex }
                ]}
              >
                {/* 1. SLOT LABEL */}
                <Surface 
                  elevation={2}
                  style={[
                    styles.labelPill, 
                    isRotated ? styles.labelRotated : styles.labelStandard
                  ]}
                >
                  <Text 
                    variant="labelSmall" 
                    style={[styles.labelText, { color: theme.colors.primary }]}
                    numberOfLines={2}
                  >
                    {t(`spreads:${spread.id}.positions.${slot.id}.label`).toUpperCase()}
                  </Text>
                </Surface>

                {/* 2. CARD AREA */}
                <TouchableOpacity 
                    onPress={() => onSlotPress(slot.id)}
                    activeOpacity={0.9}
                    style={[
                        styles.cardTouchArea,
                        { transform: [{ rotate: `${rotation}deg` }] }
                    ]}
                >
                    {/* GHOST SLOT */}
                    {!drawn && (
                        <View style={[styles.ghostSlot, { borderColor: theme.colors.outlineVariant }]} />
                    )}

                    <View style={styles.cardShadowWrapper}>
                        <CardFlip
                            deckId={deckId}
                            cardId={drawn?.cardId || null}
                            isReversed={drawn?.isReversed}
                            onFlip={() => onSlotPress(slot.id)}
                            width={CARD_WIDTH}
                            height={CARD_HEIGHT}
                        />
                    </View>
                </TouchableOpacity>

                {/* 3. POSITION BADGE */}
                <Surface 
                  elevation={4}
                  style={[
                    styles.badge, 
                    { backgroundColor: theme.colors.elevation.level5 },
                    isRotated ? { top: -8, right: -8 } : { bottom: -8, right: -8 }
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                    {index + 1}
                  </Text>
                </Surface>

              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableMat: {
    position: 'relative',
  },
  slotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTouchArea: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardShadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,
  },
  ghostSlot: {
    position: 'absolute',
    width: CARD_WIDTH - 4,
    height: CARD_HEIGHT - 4,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  labelPill: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 100,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 60,
  },
  labelText: {
    fontSize: 9, 
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'serif',
  },
  labelStandard: {
    top: -30,
    alignSelf: 'center',
  },
  labelRotated: {
    left: CARD_WIDTH - 15,
    top: CARD_HEIGHT / 2 - 15,
  },
  badge: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: 11, 
    fontWeight: '900',
    fontFamily: 'serif',
  }
});