import React, { useMemo } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Avatar, ProgressBar, Text, useTheme } from 'react-native-paper';

import { CardImage } from '../../components/CardImage';
import { GlassSurface } from '../../components/GlassSurface';
import { getDeck } from '../../services/deckRegistry';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateStats } from '../../utils/statistics';
import { ScreenContainer } from '../ScreenContainer';

// Icon Map
const GROUP_ICONS: Record<string, string> = {
  swords: 'sword',
  cups: 'cup-water',
  wands: 'auto-fix',
  pentacles: 'pentagram',
  coins: 'pentagram',
  major: 'star-shooting',
  default: 'cards-diamond',
};

const StatsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { readings } = useHistoryStore();
  const { activeDeckId } = useSettingsStore();

  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);
  const stats = useMemo(() => calculateStats(readings, activeDeckId), [readings, activeDeckId]);

  const isValidTopCard = useMemo(() => {
    if (!stats.topCardId || !deck) return false;
    return deck.cards.some((c) => c.id === stats.topCardId);
  }, [stats.topCardId, deck]);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            {t('common:insights', 'Your Patterns')}
          </Text>
          <Text
            variant="labelLarge"
            style={[styles.headerSubtitle, { color: theme.colors.primary }]}
          >
            {t('common:stats_subtitle', 'ELEMENTAL ALIGNMENT')}
          </Text>
        </View>

        {/* SUMMARY TILES */}
        <View style={styles.summaryRow}>
          <GlassSurface intensity={20} style={styles.summaryTile}>
            <Text
              variant="headlineMedium"
              style={[styles.summaryNumber, { color: theme.colors.primary }]}
            >
              {stats.totalReadings}
            </Text>
            <Text variant="labelSmall" style={styles.summaryLabel}>
              {t('common:readings', 'READINGS')}
            </Text>
          </GlassSurface>

          <GlassSurface intensity={20} style={styles.summaryTile}>
            <Text variant="headlineMedium" style={styles.summaryNumber}>
              {stats.totalCards}
            </Text>
            <Text variant="labelSmall" style={styles.summaryLabel}>
              {t('common:cards', 'CARDS')}
            </Text>
          </GlassSurface>
        </View>

        {/* SPOTLIGHT */}
        {isValidTopCard && stats.topCardId && (
          <GlassSurface intensity={35} style={styles.spotlightCard}>
            <View
              style={[styles.spotlightGlow, { backgroundColor: theme.colors.primary + '15' }]}
            />

            <Text variant="labelMedium" style={styles.spotlightHeader}>
              {t('common:recurring_card_title', 'THE RECURRING SHADOW')}
            </Text>

            <View style={styles.spotlightContent}>
              <View style={styles.cardFrame}>
                <CardImage
                  deckId={activeDeckId}
                  cardId={stats.topCardId}
                  style={styles.spotlightImage}
                />
              </View>

              <View style={styles.spotlightText}>
                <Text variant="titleLarge" style={styles.topCardName}>
                  {t(`decks:${activeDeckId}.cards.${stats.topCardId}.name`, {
                    defaultValue: '???',
                  })}
                </Text>
                <GlassSurface intensity={10} style={styles.countBadge}>
                  <Text style={[styles.countBadgeText, { color: theme.colors.primary }]}>
                    {stats.topCardCount} {t('common:times', 'times')}
                  </Text>
                </GlassSurface>
                <Text variant="bodySmall" style={styles.spotlightDesc}>
                  {t(
                    'common:recurring_card_message',
                    'This energy consistently manifests in your journey.'
                  )}
                </Text>
              </View>
            </View>
          </GlassSurface>
        )}

        {/* ELEMENTAL BALANCE */}
        <GlassSurface intensity={15} style={styles.balanceSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('common:elemental_balance_title', 'Elemental Balance')}
          </Text>

          {deck?.info?.groups &&
            Object.entries(deck.info.groups).map(([groupKey, config]: [string, any]) => {
              const count = stats.suitCounts[groupKey] || 0;
              const percentage = stats.totalCards > 0 ? count / stats.totalCards : 0;
              const iconName = GROUP_ICONS[groupKey.toLowerCase()] || GROUP_ICONS.default;

              return (
                <View key={groupKey} style={styles.progressItem}>
                  <View style={styles.progressLabelRow}>
                    <View style={styles.iconAndLabel}>
                      <Avatar.Icon
                        size={24}
                        icon={iconName}
                        style={{ backgroundColor: 'transparent' }}
                        color={config.color || theme.colors.onSurface}
                      />
                      <Text variant="bodyMedium" style={styles.groupName}>
                        {t(`common:${config.labelKey}`, groupKey)}
                      </Text>
                    </View>
                    <Text variant="labelLarge" style={{ fontWeight: 'bold', opacity: 0.8 }}>
                      {Math.round(percentage * 100)}%
                    </Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <ProgressBar
                      progress={percentage}
                      color={config.color || theme.colors.primary}
                      style={styles.progressBar}
                    />
                  </View>
                </View>
              );
            })}

          {stats.totalReadings === 0 && (
            <Text style={styles.emptyText}>
              {t('common:no_data_yet', 'Your journey has just begun.')}
            </Text>
          )}
        </GlassSurface>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 25,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    letterSpacing: 2,
    marginTop: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryTile: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryNumber: {
    fontWeight: '900',
    fontFamily: 'serif',
    fontSize: 28,
  },
  summaryLabel: {
    opacity: 0.5,
    letterSpacing: 1.5,
    marginTop: 4,
    fontSize: 9,
  },
  spotlightCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  spotlightGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  spotlightHeader: {
    letterSpacing: 2,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  spotlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFrame: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  spotlightImage: {
    width: 90,
    height: 155,
    borderRadius: 12,
  },
  spotlightText: {
    flex: 1,
    marginLeft: 20,
  },
  topCardName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    lineHeight: 26,
    fontSize: 20,
  },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  spotlightDesc: {
    opacity: 0.6,
    fontStyle: 'italic',
    lineHeight: 18,
    fontSize: 12,
  },
  balanceSection: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  progressItem: {
    marginBottom: 22,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 14,
    opacity: 0.9,
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default StatsScreen;
