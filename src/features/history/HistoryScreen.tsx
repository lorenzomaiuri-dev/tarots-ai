import React, { useMemo, useState } from 'react';

import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Avatar, Button, IconButton, Searchbar, Text, useTheme } from 'react-native-paper';

import { GlassSurface } from '../../components/GlassSurface';
import { useHaptics } from '../../hooks/useHaptics';
import { useHistoryStore } from '../../store/useHistoryStore';
import { RootStackParamList } from '../../types/navigation';
import { ReadingSession } from '../../types/reading';
import { ScreenContainer } from '../ScreenContainer';

const HistoryScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

  const { readings, deleteReading } = useHistoryStore();

  const filteredReadings = useMemo(() => {
    let result = [...readings].sort((a, b) => b.timestamp - a.timestamp);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => {
        const spreadName = t(`spreads:${r.spreadId}.name`).toLowerCase();
        return spreadName.includes(q) || r.userNotes?.toLowerCase().includes(q);
      });
    }
    return result;
  }, [readings, searchQuery, t]);

  const confirmDelete = () => {
    if (readingToDelete) {
      deleteReading(readingToDelete);
      setReadingToDelete(null);
      haptics.notification('success');
    }
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          haptics.impact('heavy');
          setReadingToDelete(id);
        }}
        activeOpacity={0.8}
      >
        <GlassSurface intensity={40} style={styles.deleteGlass}>
          <Avatar.Icon
            size={40}
            icon="trash-can-outline"
            style={{ backgroundColor: 'transparent' }}
            color={theme.colors.error}
          />
        </GlassSurface>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ReadingSession }) => {
    const dateObj = new Date(item.timestamp);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();

    return (
      <View style={styles.cardWrapper}>
        <Swipeable
          renderRightActions={() => renderRightActions(item.id)}
          friction={2}
          rightThreshold={40}
          onSwipeableOpen={() => haptics.selection()}
        >
          <TouchableOpacity
            onPress={() => {
              haptics.impact('light');
              navigation.navigate('ReadingDetail', { readingId: item.id });
            }}
            activeOpacity={0.9}
          >
            <GlassSurface intensity={15} style={styles.journalCard}>
              <View
                style={[
                  styles.dateSide,
                  { backgroundColor: theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
                ]}
              >
                <Text style={[styles.dateDay, { color: theme.colors.primary }]}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>

              <View style={styles.contentMain}>
                <Text
                  variant="labelSmall"
                  style={[styles.deckName, { color: theme.colors.secondary }]}
                >
                  {t(`decks:${item.deckId}.info.name`).toUpperCase()}
                </Text>
                <Text variant="titleMedium" style={styles.spreadTitle}>
                  {t(`spreads:${item.spreadId}.name`)}
                </Text>

                <View style={styles.badgeRow}>
                  <GlassSurface intensity={5} style={styles.miniBadge}>
                    <Text style={styles.miniBadgeText}>
                      {item.cards.length} {t('common:cards', 'CARDS')}
                    </Text>
                  </GlassSurface>
                  {item.aiInterpretation && (
                    <GlassSurface
                      intensity={20}
                      style={[
                        styles.miniBadge,
                        { backgroundColor: theme.colors.primaryContainer + '40' },
                      ]}
                    >
                      <Text
                        style={[styles.miniBadgeText, { color: theme.colors.onPrimaryContainer }]}
                      >
                        ✨ {t('common:ai_insight', 'INSIGHT')}
                      </Text>
                    </GlassSurface>
                  )}
                </View>
              </View>
              <IconButton
                icon="chevron-right"
                size={20}
                style={styles.chevron}
                iconColor={theme.colors.onSurfaceDisabled}
              />
            </GlassSurface>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenContainer>
        <FlatList
          data={filteredReadings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* STATS */}
              <View style={styles.headerRow}>
                <View>
                  <Text variant="headlineMedium" style={styles.pageTitle}>
                    {t('common:journal_title', 'Chronicles')}
                  </Text>
                  <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
                </View>
                <IconButton
                  icon="chart-timeline-variant"
                  mode="contained-tonal"
                  size={24}
                  onPress={() => navigation.navigate('Stats')}
                  style={styles.statsButton}
                />
              </View>

              <Searchbar
                placeholder={t('common:search_journal', 'Search your destiny...')}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={styles.searchInput}
                mode="bar"
                elevation={0}
              />

              <Text
                variant="labelLarge"
                style={[styles.sectionLabel, { color: theme.colors.primary }]}
              >
                {t('common:past_readings', 'RECENT MEMORIES')}
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Avatar.Icon
                size={80}
                icon="book-outline"
                style={{ backgroundColor: 'transparent' }}
                color={theme.colors.onSurfaceDisabled}
              />
              <Text style={styles.emptyText}>
                {t('common:no_history_yet', 'No memories recorded yet...')}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listPadding}
        />
      </ScreenContainer>

      {/* DELETE MODAL */}
      <Modal visible={!!readingToDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassSurface intensity={60} style={styles.deleteModal}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              {t('common:delete_reading', 'Erase Memory')}
            </Text>
            <Text variant="bodyMedium" style={styles.modalBody}>
              {t(
                'common:confirm_delete',
                'Are you sure you want to remove this record from your chronicles?'
              )}
            </Text>
            <View style={styles.modalActions}>
              <Button mode="text" onPress={() => setReadingToDelete(null)} style={{ flex: 1 }}>
                {t('common:cancel', 'Cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={confirmDelete}
                buttonColor={theme.colors.error}
                textColor="white"
                style={{ flex: 1 }}
              >
                {t('common:delete', 'Erase')}
              </Button>
            </View>
          </GlassSurface>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  accentLine: {
    height: 3,
    width: 25,
    marginTop: 8,
    borderRadius: 2,
  },
  statsButton: {
    margin: 0,
    borderRadius: 12,
  },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: 16,
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.6,
  },
  searchBar: {
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    fontSize: 14,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  journalCard: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 110,
    overflow: 'hidden',
  },
  dateSide: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateDay: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '900',
    opacity: 0.5,
    letterSpacing: 1,
  },
  contentMain: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  deckName: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.6,
  },
  spreadTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  chevron: {
    alignSelf: 'center',
    marginRight: 4,
  },
  deleteAction: {
    width: 80,
    height: '100%',
    paddingLeft: 10,
    justifyContent: 'center',
  },
  deleteGlass: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteModal: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default HistoryScreen;
