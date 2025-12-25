import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CardFlip } from './CardFlip';
import { Spread, DrawnCard } from '../types/reading';
import { useTranslation } from 'react-i18next';

// Configuration for visual sizing
const CARD_WIDTH = 100;
const CARD_HEIGHT = 160;
const GUTTER = 20; // Space between cards

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
  // We need to know the max X and Y to set the container size
  let maxX = 0;
  let maxY = 0;

  spread.slots.forEach(slot => {
    if (slot.layout) {
      if (slot.layout.x > maxX) maxX = slot.layout.x;
      if (slot.layout.y > maxY) maxY = slot.layout.y;
    }
  });

  const canvasWidth = (maxX + 1) * (CARD_WIDTH + GUTTER) + GUTTER * 2;
  const canvasHeight = (maxY + 1) * (CARD_HEIGHT + GUTTER) + GUTTER * 2;

  return (
    <ScrollView 
      horizontal 
      contentContainerStyle={{ width: Math.max(canvasWidth, 400) }} // Min width to avoid cramped feel
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={{ height: Math.max(canvasHeight, 500) }} 
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tableMat, { width: canvasWidth, height: canvasHeight }]}>
          
          {spread.slots.map((slot) => {
            const layout = slot.layout || { x: 0, y: 0 };
            const drawn = drawnCards.find(c => c.positionId === slot.id);
            
            // Calculate absolute position
            const top = layout.y * (CARD_HEIGHT + GUTTER) + GUTTER;
            const left = layout.x * (CARD_WIDTH + GUTTER) + GUTTER;

            // Handle rotation (e.g., Celtic Cross crossing card)
            const rotation = layout.rotation || 0;

            return (
              <View 
                key={slot.id} 
                style={[
                  styles.slotContainer, 
                  { top, left, width: CARD_WIDTH, height: CARD_HEIGHT }
                ]}
              >
                {/* Visual Label (only if empty) */}
                {!drawn && (
                    <Text 
                        variant="labelSmall" 
                        style={styles.slotLabel}
                        numberOfLines={1}
                    >
                        {t(`spreads:${spread.id}.positions.${slot.label}.label`)}
                    </Text>
                )}

                <TouchableOpacity 
                    onPress={() => !drawn && onSlotPress(slot.id)}
                    activeOpacity={0.9}
                    style={{ transform: [{ rotate: `${rotation}deg` }] }}
                >
                    <View style={[
                        styles.cardPlaceholder, 
                        !drawn && { borderColor: theme.colors.onSurfaceDisabled }
                    ]}>
                        <CardFlip
                            deckId={deckId}
                            cardId={drawn?.cardId || null}
                            isReversed={drawn?.isReversed}
                            onFlip={() => !drawn && onSlotPress(slot.id)}
                            width={CARD_WIDTH}
                            height={CARD_HEIGHT}
                        />
                    </View>
                </TouchableOpacity>

                {/* Show small badge for number order */}
                <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                  <Text 
                      numberOfLines={1} 
                      style={{ 
                          fontSize: 11,
                          color: theme.colors.onPrimary, 
                          fontWeight: 'bold',
                          textAlign: 'center'
                      }}
                  >
                      {slot.id}
                  </Text>
              </View>

              </View>
            );
          })}

        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableMat: {
    // optional: add a felt texture or color here
  },
  slotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholder: {
    borderRadius: 8,
    // borderStyle: 'dashed',
    // borderWidth: 1,
  },
  slotLabel: {
    position: 'absolute',
    top: -20,
    width: 120,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 10,
  },
  badge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: 'white', 
  }
});