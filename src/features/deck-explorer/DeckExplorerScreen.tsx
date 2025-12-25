import React, { useMemo, useState, useCallback } from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { Text, useTheme, Searchbar, Chip, IconButton, Button, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../ScreenContainer';
import { CardImage } from '../../components/CardImage';
import { getDeck } from '../../services/deckRegistry';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card } from '../../types/deck';
import { useInterpretation } from '../../hooks/useInterpretation';
import { InterpretationModal } from '../../components/InterpretationModal';

// TODO: CONST
const question: string = "Analyze the visual symbolism, colors, and archetypal meaning of this specific card in this deck"
const PAGE_SIZE = 10

// Helper for cards grouping
const groupCards = (cards: Card[], t: any, deckId: string) => {  
  const groups: { title: string; data: Card[] }[] = [
    { title: t('common:major_arcana', "Major Arcana"), data: [] },
    { title: t('common:wands', "Wands"), data: [] },
    { title: t('common:cups', "Cups"), data: [] },
    { title: t('common:swords', "Swords"), data: [] },
    { title: t('common:pentacles', "Pentacles"), data: [] },
  ];

  cards.forEach(card => {
    if (card.meta.type === 'major') groups[0].data.push(card);
    else if (card.meta.suit === 'wands') groups[1].data.push(card);
    else if (card.meta.suit === 'cups') groups[2].data.push(card);
    else if (card.meta.suit === 'swords') groups[3].data.push(card);
    else if (card.meta.suit === 'pentacles') groups[4].data.push(card);
  });

  return groups.filter(g => g.data.length > 0);
};

const DeckExplorerScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { activeDeckId } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  // AI
  const { result, isLoading, error, interpretReading } = useInterpretation();
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);

  // Reset the limit when searching
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDisplayLimit(PAGE_SIZE); 
  };

  const sections = useMemo(() => {
    if (!deck) return [];
    
    let filtered = deck.cards;
    
    // 1. Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const name = t(`decks:${activeDeckId}.cards.${c.id}.name`).toLowerCase();
        return name.includes(q);
      });
    }

    // 2. SLICE the data for Lazy Loading
    const paginatedCards = filtered.slice(0, displayLimit);

    // 3. Group only the sliced cards
    return groupCards(paginatedCards, t, activeDeckId);
  }, [deck, searchQuery, activeDeckId, t, displayLimit]);

  const loadMore = useCallback(() => {
    if (deck && displayLimit < deck.cards.length) {
      setDisplayLimit(prev => prev + PAGE_SIZE);
    }
  }, [displayLimit, deck]);

  const handleAnalyzeSymbolism = () => {
    if (!selectedCard || !deck) return;
    setAiModalVisible(true);
    
    if (!result) {
        // TODO: ADD SPREAD
        interpretReading(
            activeDeckId, 
            { id: 'study', slots: [{id: 'main'}] }, // Fake spread
            [{ cardId: selectedCard.id, deckId: activeDeckId, positionId: 'main', isReversed: false }],
            question
        );
    }
  };

  if (!deck) return null;

  return (
    <ScreenContainer>
      <Searchbar
        placeholder={t('common:search_cards', "Search for cards...")}
        onChangeText={handleSearch}
        value={searchQuery}
        style={{ marginBottom: 16, backgroundColor: theme.colors.elevation.level2 }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.primary }]}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardItem} 
            onPress={() => setSelectedCard(item)}
          >
             <CardImage deckId={activeDeckId} cardId={item.id} style={styles.thumbnail} />
             <Text variant="bodyMedium" style={{ marginLeft: 16 }}>
               {t(`decks:${activeDeckId}.cards.${item.id}.name`)}
             </Text>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5} // Trigger when half-way through the last visible item
        initialNumToRender={10}     // Reduce initial heavy lifting
        maxToRenderPerBatch={10}    // Don't overwhelm the bridge
        windowSize={5}              // Amount of content kept rendered (lower = less memory)
        removeClippedSubviews={true} // Unmount off-screen components
        stickySectionHeadersEnabled={false}
      />

      {/* MODAL CARD DETAIL (Reference View) */}
      <Modal visible={!!selectedCard} animationType="slide" onRequestClose={() => setSelectedCard(null)}>
         <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            {selectedCard && (
                <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                    <IconButton 
                        icon="chevron-down" 
                        size={30} 
                        style={{ alignSelf: 'flex-start' }}
                        onPress={() => setSelectedCard(null)} 
                    />
                    
                    <CardImage 
                        deckId={activeDeckId} 
                        cardId={selectedCard.id} 
                        style={styles.largeImage} 
                    />

                    <Text variant="headlineMedium" style={styles.cardTitle}>
                        {t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`)}
                    </Text>
                    
                    <View style={styles.metaContainer}>
                        <Chip icon="cards-outline" style={{ marginRight: 8 }}>
                            {selectedCard.meta.type.toUpperCase()}
                        </Chip>
                        {selectedCard.meta.suit && (
                            <Chip icon="water-outline">
                                {selectedCard.meta.suit.toUpperCase()}
                            </Chip>
                        )}
                    </View>

                    <Text variant="bodyLarge" style={styles.keywords}>
                        {t(`decks:${activeDeckId}.cards.${selectedCard.id}.keywords`)}
                    </Text>
                    
                    <Button 
                        mode="contained" 
                        icon="creation" 
                        onPress={handleAnalyzeSymbolism}
                        style={{ marginTop: 32, width: '100%' }}
                    >
                        {t('common:interpreta', "Interpret")}
                    </Button>
                </ScrollView>
            )}
         </View>
      </Modal>

      {/* MODAL AI RESULT */}
      <InterpretationModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        isLoading={isLoading}
        content={result}
        error={error}
        title={`Studio: ${selectedCard ? t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`) : ''}`}
      />

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingVertical: 8,
    marginTop: 16,
    fontWeight: 'bold',
    backgroundColor: 'transparent'
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  thumbnail: {
    width: 40,
    height: 70,
    borderRadius: 4,
  },
  modalContainer: {
      flex: 1,
  },
  largeImage: {
      width: 250,
      height: 400,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
  },
  cardTitle: {
      fontWeight: 'bold',
      fontFamily: 'serif',
      marginBottom: 16,
      textAlign: 'center',
  },
  metaContainer: {
      flexDirection: 'row',
      marginBottom: 16,
  },
  keywords: {
      textAlign: 'center',
      opacity: 0.7,
      fontStyle: 'italic',
  }
});

export default DeckExplorerScreen;