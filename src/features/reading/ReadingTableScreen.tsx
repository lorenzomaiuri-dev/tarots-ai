import React, { useEffect, useState } from 'react';

import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Button, SegmentedButtons, Text, useTheme } from 'react-native-paper';

import { CardFlip } from '../../components/CardFlip';
import { GlassSurface } from '../../components/GlassSurface';
import { InterpretationModal } from '../../components/InterpretationModal';
import { SpreadVisualizer } from '../../components/SpreadVisualizer';
import spreadsData from '../../data/spreads.json';
import { useHaptics } from '../../hooks/useHaptics';
import { useInterpretation } from '../../hooks/useInterpretation';
import { getDeck } from '../../services/deckRegistry';
import { drawCards } from '../../services/rng';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { RootStackParamList } from '../../types/navigation';
import { DrawnCard, ReadingSession, Spread } from '../../types/reading';
import { ScreenContainer } from '../ScreenContainer';

type ReadingTableRouteProp = RouteProp<RootStackParamList, 'ReadingTable'>;
const { width } = Dimensions.get('window');

const ReadingTableScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReadingTableRouteProp>();

  const { activeDeckId, preferences } = useSettingsStore();
  const { addReading } = useHistoryStore();

  const [spread, setSpread] = useState<Spread | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [viewMode, setViewMode] = useState('table');

  const [modalVisible, setModalVisible] = useState(false);
  const { result, isLoading, error, interpretReading } = useInterpretation();

  useEffect(() => {
    const foundSpread = spreadsData.find((s) => s.id === route.params.spreadId);
    if (foundSpread) setSpread(foundSpread as Spread);
  }, [route.params.spreadId]);

  const handleDrawCard = (slotId: string) => {
    const deck = getDeck(activeDeckId);
    if (!deck) return;

    let deckToUse = deck;
    if (preferences.onlyMajorArcana) {
      deckToUse = { ...deck, cards: deck.cards.filter((c) => c.meta.type === 'major') };
    }

    const alreadyDrawnIds = drawnCards.map((d) => d.cardId);
    const availableCardsDeck = {
      ...deckToUse,
      cards: deckToUse.cards.filter((c) => !alreadyDrawnIds.includes(c.id)),
    };

    if (availableCardsDeck.cards.length === 0) {
      Alert.alert(t('common:error_deck_empty', 'Empty Deck!'));
      return;
    }

    const results = drawCards(availableCardsDeck, 1, undefined, preferences.allowReversed);
    const newCard: DrawnCard = {
      cardId: results[0].card.id,
      deckId: activeDeckId,
      positionId: slotId,
      isReversed: results[0].isReversed,
    };
    haptics.impact('medium');
    setDrawnCards((prev) => [...prev, newCard]);
  };

  const handleInterpret = async () => {
    if (!spread) return;
    setModalVisible(true);
    if (!result) {
      let questionToAsk =
        route.params.customQuestion ||
        (spread.defaultQuestionKey
          ? t(`prompts:${spread.defaultQuestionKey}`)
          : t('prompts:general_guidance'));
      await interpretReading(activeDeckId, spread, drawnCards, questionToAsk);
    }
  };

  const handleSaveAndExit = () => {
    const session: ReadingSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      spreadId: spread?.id || '',
      deckId: activeDeckId,
      cards: drawnCards,
      aiInterpretation: result || undefined,
    };
    addReading(session);
    haptics.notification('success');
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  if (!spread) return null;
  const isReadingComplete = drawnCards.length === spread.slots.length;

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      {/* HEADER: GLASSY SEGMENTED CONTROL */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {t(`spreads:${spread.id}.name`)}
        </Text>
        <View style={styles.segmentedWrapper}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'table', label: t('common:table', 'Table'), icon: 'view-grid-outline' },
              { value: 'list', label: t('common:list', 'List'), icon: 'format-list-bulleted' },
            ]}
            density="small"
            style={styles.segmentedInner}
          />
        </View>
      </View>

      {/* CONTENT AREA */}
      <View style={{ flex: 1 }}>
        {viewMode === 'table' ? (
          <SpreadVisualizer
            spread={spread}
            deckId={activeDeckId}
            drawnCards={drawnCards}
            onSlotPress={handleDrawCard}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {spread.slots.map((slot, index) => {
              const drawn = drawnCards.find((c) => c.positionId === slot.id);
              return (
                <View key={slot.id} style={styles.slotContainer}>
                  <GlassSurface intensity={20} style={styles.slotTextCard}>
                    <Text
                      variant="labelLarge"
                      style={[styles.slotLabel, { color: theme.colors.primary }]}
                    >
                      {index + 1} — {t(`spreads:${spread.id}.positions.${slot.id}.label`)}
                    </Text>
                    <Text variant="bodyMedium" style={styles.slotDesc}>
                      {t(`spreads:${spread.id}.positions.${slot.id}.description`)}
                    </Text>
                  </GlassSurface>

                  <View style={styles.cardWrapper}>
                    <CardFlip
                      deckId={activeDeckId}
                      cardId={drawn?.cardId || null}
                      isReversed={drawn?.isReversed}
                      onFlip={() => !drawn && handleDrawCard(slot.id)}
                      width={160}
                      height={260}
                    />
                  </View>

                  {drawn && (
                    <Text variant="titleMedium" style={styles.cardName}>
                      {t(`decks:${activeDeckId}.cards.${drawn.cardId}.name`)}
                      {drawn.isReversed ? ` (${t('common:reversed', 'Reversed')})` : ''}
                    </Text>
                  )}
                </View>
              );
            })}
            <View style={styles.footerSpace} />
          </ScrollView>
        )}
      </View>

      {/* FLOATING ACTION DOCK */}
      {isReadingComplete && (
        <View style={styles.dockContainer}>
          <BlurView intensity={80} tint={theme.dark ? 'dark' : 'light'} style={styles.dockBlur}>
            <Button
              mode="text"
              onPress={handleSaveAndExit}
              style={styles.dockButton}
              textColor={theme.colors.onSurfaceVariant}
            >
              {t('common:save', 'Save')}
            </Button>
            <View style={styles.dockDivider} />
            <Button
              mode="text"
              icon="creation"
              onPress={handleInterpret}
              style={styles.dockButton}
              textColor={theme.colors.primary}
              labelStyle={{ fontWeight: 'bold' }}
            >
              {t('common:ai', 'Deep Insight')}
            </Button>
          </BlurView>
        </View>
      )}

      <InterpretationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isLoading={isLoading}
        content={result}
        error={error}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 1,
    fontSize: 20,
  },
  segmentedWrapper: {
    marginTop: 12,
    width: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  segmentedInner: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingBottom: 150,
    paddingTop: 10,
    alignItems: 'center',
  },
  slotContainer: {
    marginBottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  slotTextCard: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 20,
    width: width * 0.9,
    alignItems: 'center',
  },
  slotLabel: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 8,
    fontSize: 11,
  },
  slotDesc: {
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
    fontFamily: 'serif',
    lineHeight: 22,
    fontSize: 14,
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  cardName: {
    marginTop: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  dockContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dockBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dockButton: {
    flex: 1,
  },
  dockDivider: {
    width: 1,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  footerSpace: {
    height: 120,
  },
});

export default ReadingTableScreen;
