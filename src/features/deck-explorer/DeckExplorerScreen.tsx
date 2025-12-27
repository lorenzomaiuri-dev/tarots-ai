import React, { useCallback, useMemo, useState } from 'react';

import {
  Dimensions,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';

import { useTranslation } from 'react-i18next';
import { Avatar, Button, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';

// Components
import { CardImage } from '../../components/CardImage';
import { GlassSurface } from '../../components/GlassSurface';
import { InterpretationModal } from '../../components/InterpretationModal';
import { useHaptics } from '../../hooks/useHaptics';
// Logic & Types
import { useInterpretation } from '../../hooks/useInterpretation';
import { getDeck } from '../../services/deckRegistry';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card, Deck } from '../../types/deck';
import { ScreenContainer } from '../ScreenContainer';

const { width, height } = Dimensions.get('window');
const PAGE_SIZE = 25;

// Icons
const TYPE_ICONS: Record<string, string> = {
  major: 'star-shooting-outline',
  swords: 'sword',
  cups: 'cup-water',
  wands: 'auto-fix',
  pentacles: 'pentagram',
  coins: 'pentagram',
  default: 'cards-outline',
};

const groupCards = (cards: Card[], deck: Deck, t: any) => {
  const groupConfigs = deck.info.groups;
  const groupKeys = Object.keys(groupConfigs);
  const groupsMap: Record<string, any> = {};

  groupKeys.forEach((key) => {
    groupsMap[key] = {
      title: t(`common:${groupConfigs[key].labelKey}`),
      type: key,
      color: groupConfigs[key].color,
      data: [],
    };
  });

  cards.forEach((card) => {
    if (groupsMap[card.meta.type]) groupsMap[card.meta.type].data.push(card);
    else if (card.meta.suit && groupsMap[card.meta.suit]) groupsMap[card.meta.suit].data.push(card);
  });

  return groupKeys.map((key) => groupsMap[key]).filter((group) => group.data.length > 0);
};

const DeckExplorerScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const { activeDeckId } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const { result, isLoading, error, interpretReading } = useInterpretation();
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDisplayLimit(PAGE_SIZE);
  };

  const sections = useMemo(() => {
    if (!deck) return [];
    let filtered = [...deck.cards];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        t(`decks:${activeDeckId}.cards.${c.id}.name`).toLowerCase().includes(q)
      );
    }
    return groupCards(filtered.slice(0, displayLimit), deck, t);
  }, [deck, searchQuery, activeDeckId, t, displayLimit]);

  const loadMore = useCallback(() => {
    if (deck && displayLimit < deck.cards.length) {
      setDisplayLimit((prev) => prev + PAGE_SIZE);
    }
  }, [displayLimit, deck]);

  const handleAnalyzeSymbolism = () => {
    if (!selectedCard) return;
    setAiModalVisible(true);
    interpretReading(
      activeDeckId,
      { id: 'study', slots: [{ id: 'main', label: 'main' }] } as any,
      [{ cardId: selectedCard.id, deckId: activeDeckId, positionId: 'main', isReversed: false }],
      t('questions:symbolism_analysis', 'Analyze the visual symbolism...')
    );
  };

  if (!deck) return null;

  return (
    <ScreenContainer>
      {/* HEADER */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('common:explorer', 'The Archive')}
        </Text>
        <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
      </View>

      <Searchbar
        placeholder={t('common:search_cards', 'Search the cards...')}
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
        mode="bar"
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        onEndReached={loadMore}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Avatar.Icon
              size={20}
              icon={TYPE_ICONS[section.type] || TYPE_ICONS.default}
              style={{ backgroundColor: 'transparent' }}
              color={section.color || theme.colors.primary}
            />
            <Text
              variant="labelLarge"
              style={[
                styles.sectionHeaderText,
                { color: section.color || theme.colors.onSurfaceVariant },
              ]}
            >
              {section.title.toUpperCase()}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              haptics.impact('light');
              setSelectedCard(item);
            }}
            activeOpacity={0.8}
          >
            <GlassSurface intensity={10} style={styles.cardItem}>
              <CardImage deckId={activeDeckId} cardId={item.id} style={styles.thumbnail} />
              <View style={styles.itemInfo}>
                <Text variant="titleMedium" style={styles.cardName}>
                  {t(`decks:${activeDeckId}.cards.${item.id}.name`)}
                </Text>
                <Text variant="labelSmall" style={styles.cardMeta}>
                  {item.meta.type === 'major' ? t('common:major') : t(`common:${item.meta.suit}`)}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={18}
                iconColor={theme.colors.onSurfaceDisabled}
              />
            </GlassSurface>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 4 }}
      />

      {/* FULL SCREEN DETAIL */}
      <Modal visible={!!selectedCard} animationType="fade" transparent>
        <BlurView
          intensity={95}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          {selectedCard && (
            <View style={{ flex: 1 }}>
              <IconButton
                icon="close"
                size={28}
                style={styles.closeBtn}
                onPress={() => setSelectedCard(null)}
              />

              <ScrollView
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.imageShadowFrame}>
                  <CardImage
                    deckId={activeDeckId}
                    cardId={selectedCard.id}
                    style={styles.largeImage}
                  />
                </View>

                <Text variant="headlineMedium" style={styles.modalCardTitle}>
                  {t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`)}
                </Text>

                <View style={styles.badgeRow}>
                  <GlassSurface intensity={20} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{selectedCard.meta.type.toUpperCase()}</Text>
                  </GlassSurface>
                  {selectedCard.meta.suit && (
                    <GlassSurface intensity={20} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{selectedCard.meta.suit.toUpperCase()}</Text>
                    </GlassSurface>
                  )}
                </View>

                <GlassSurface intensity={15} style={styles.keywordsBox}>
                  <Text variant="bodyLarge" style={styles.keywordsText}>
                    {t(`decks:${activeDeckId}.cards.${selectedCard.id}.keywords`)}
                  </Text>
                </GlassSurface>

                <Button
                  mode="contained"
                  icon="creation"
                  onPress={handleAnalyzeSymbolism}
                  style={styles.studyButton}
                  contentStyle={{ height: 56 }}
                >
                  {t('common:study_symbolism', 'Study Symbolism')}
                </Button>
                <View style={styles.footerSpacing} />
              </ScrollView>
            </View>
          )}
        </BlurView>
      </Modal>

      <InterpretationModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        isLoading={isLoading}
        content={result}
        error={error}
        title={selectedCard ? t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`) : ''}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: 10, marginBottom: 20 },
  title: { fontFamily: 'serif', fontWeight: 'bold' },
  accentLine: { height: 1, width: 40, marginTop: 12, opacity: 0.5 },
  searchBar: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 6 },
  sectionHeaderText: { letterSpacing: 2, fontWeight: '900', fontSize: 10, opacity: 0.6 },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  thumbnail: { width: 54, height: 90, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 16 },
  cardName: { fontFamily: 'serif', fontWeight: 'bold', fontSize: 17 },
  cardMeta: {
    opacity: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 9,
    fontWeight: 'bold',
  },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  modalContent: { paddingTop: 100, paddingHorizontal: 32, alignItems: 'center' },
  imageShadowFrame: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
    marginBottom: 40,
  },
  largeImage: { width: width * 0.65, height: height * 0.48, borderRadius: 24 },
  modalCardTitle: {
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 32,
  },
  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  tagBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  keywordsBox: {
    padding: 24,
    borderRadius: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  keywordsText: {
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
    fontFamily: 'serif',
    lineHeight: 26,
    fontSize: 15,
  },
  studyButton: { marginTop: 40, width: '100%', borderRadius: 16 },
  footerSpacing: { height: 80 },
});

export default DeckExplorerScreen;
