import React from 'react';

import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';

import { useHaptics } from '../hooks/useHaptics';
import { DrawnCard, Spread } from '../types/reading';
// Components
import { CardFlip } from './CardFlip';
import { GlassSurface } from './GlassSurface';

// Configuration for visual sizing
const CARD_WIDTH = 115; // Slightly wider for better presence
const CARD_HEIGHT = 190;
const GUTTER = 30;

interface Props {
  spread: Spread;
  deckId: string;
  drawnCards: DrawnCard[];
  onSlotPress: (slotId: string) => void;
}

export const SpreadVisualizer: React.FC<Props> = ({ spread, deckId, drawnCards, onSlotPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();

  // 1. Calculate Canvas Size
  let maxX = 0;
  let maxY = 0;

  spread.slots.forEach((slot) => {
    const layout = slot.layout || { x: 0, y: 0 };
    if (layout.x > maxX) maxX = layout.x;
    if (layout.y > maxY) maxY = layout.y;
  });

  const canvasWidth = (maxX + 1) * (CARD_WIDTH + GUTTER) + GUTTER * 2;
  const canvasHeight = (maxY + 1) * (CARD_HEIGHT + GUTTER) + GUTTER * 4;

  const handlePress = (slotId: string) => {
    haptics.impact('light');
    onSlotPress(slotId);
  };

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{ width: Math.max(canvasWidth, Dimensions.get('window').width) }}
      showsHorizontalScrollIndicator={false}
    >
      <ScrollView
        contentContainerStyle={{ height: Math.max(canvasHeight, 650) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.tableMat, { width: canvasWidth, height: canvasHeight }]}>
          {spread.slots.map((slot, index) => {
            const layout = slot.layout || { x: 0, y: 0 };
            const drawn = drawnCards.find((c) => c.positionId === slot.id);

            const top = layout.y * (CARD_HEIGHT + GUTTER) + GUTTER * 2;
            const left = layout.x * (CARD_WIDTH + GUTTER) + GUTTER;
            const rotation = layout.rotation || 0;
            const zIndex = (layout.zIndex ?? index) + 10;

            return (
              <View
                key={slot.id}
                pointerEvents="box-none"
                style={[
                  styles.slotContainer,
                  { top, left, width: CARD_WIDTH, height: CARD_HEIGHT, zIndex },
                ]}
              >
                <GlassSurface
                  intensity={40}
                  style={[
                    styles.labelPill,
                    rotation !== 0 ? styles.labelRotated : styles.labelStandard,
                  ]}
                >
                  <Text
                    variant="labelSmall"
                    style={[styles.labelText, { color: theme.colors.primary }]}
                    numberOfLines={1}
                  >
                    {t(`spreads:${spread.id}.positions.${slot.id}.label`).toUpperCase()}
                  </Text>
                </GlassSurface>

                {/* CARD AREA */}
                <TouchableOpacity
                  onPress={() => handlePress(slot.id)}
                  activeOpacity={drawn ? 1 : 0.9}
                  style={[styles.cardTouchArea, { transform: [{ rotate: `${rotation}deg` }] }]}
                >
                  {/* GHOST SLOT*/}
                  {!drawn && (
                    <GlassSurface
                      intensity={10}
                      style={[styles.ghostSlot, { borderColor: theme.colors.primary + '30' }]}
                    />
                  )}

                  <View style={styles.cardShadowWrapper}>
                    <CardFlip
                      deckId={deckId}
                      cardId={drawn?.cardId || null}
                      isReversed={drawn?.isReversed}
                      onFlip={() => handlePress(slot.id)}
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                    />
                  </View>
                </TouchableOpacity>

                {/* POSITION BADGE */}
                <GlassSurface
                  intensity={60}
                  style={[
                    styles.badge,
                    rotation !== 0 ? { top: -6, right: -6 } : { bottom: -6, right: -6 },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.colors.onSurface }]}>
                    {index + 1}
                  </Text>
                </GlassSurface>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  ghostSlot: {
    position: 'absolute',
    width: CARD_WIDTH - 6,
    height: CARD_HEIGHT - 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'solid',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  labelPill: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 100,
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  labelText: {
    fontSize: 8,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  labelStandard: {
    top: -24,
    alignSelf: 'center',
  },
  labelRotated: {
    left: CARD_WIDTH - 20,
    top: -15,
  },
  badge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
