import React, { useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, IconButton, useTheme, Divider, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { ReadingSession } from '../../types/reading';

const HistoryScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { readings, deleteReading } = useHistoryStore();

  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => b.timestamp - a.timestamp);
  }, [readings]);

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common:delete', 'Delete'),
      t('common:confirm_delete', 'Are you sure you eant to delete?'),
      [
        { text: t('common:cancel', 'Cancel'), style: 'cancel' },
        { text: t('common:delete', 'Delete'), style: 'destructive', onPress: () => deleteReading(id) }
      ]
    );
  };

  const filteredReadings = useMemo(() => {
  // First sort
  let result = [...readings].sort((a, b) => b.timestamp - a.timestamp)
  
  // Then filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(r => {
      // Search in Spread Name (need to translate or use ID)
      const spreadMatch = r.spreadId.includes(q); 
      // Search in User Notes
      const notesMatch = r.userNotes?.toLowerCase().includes(q);
      // Search in AI Text
      const aiMatch = r.aiInterpretation?.toLowerCase().includes(q);
      
      return spreadMatch || notesMatch || aiMatch;
    });
  }
  return result;
}, [readings, searchQuery]);

  const renderItem = ({ item }: { item: ReadingSession }) => {
    // Get the first card image as a thumbnail
    const firstCard = item.cards[0];
    const dateObj = new Date(item.timestamp);

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ReadingDetail', { readingId: item.id })}
        activeOpacity={0.7}
      >
        <Surface style={[styles.itemSurface, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
          {/* Left: Date Box */}
          <View style={[styles.dateBox, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onPrimaryContainer }}>
              {dateObj.getDate()}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, textTransform: 'uppercase' }}>
              {dateObj.toLocaleDateString(undefined, { month: 'short' })}
            </Text>
          </View>

          {/* Center: Info */}
          <View style={styles.infoBox}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.spreadTitle}>
              {t(`spreads:${item.spreadId}.name`)}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.6 }}>
              {t(`decks:${item.deckId}.name`)} • {item.cards.length} cards
            </Text>
          </View>

          {/* Right: Actions */}
          <IconButton 
            icon="trash-can-outline" 
            size={20} 
            iconColor={theme.colors.error}
            onPress={() => handleDelete(item.id)} 
          />
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="headlineSmall" style={styles.header}>
          {t('common:history', 'History')}
        </Text>
        <IconButton 
          icon="chart-bar" 
          onPress={() => navigation.navigate('Stats')} 
          mode="contained-tonal"
        />
      </View>      

      <Searchbar
        placeholder={t('common:search', 'Search...')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ marginBottom: 16, backgroundColor: theme.colors.elevation.level2 }}
        inputStyle={{ minHeight: 0 }} // Fix for some android sizing issues
      />

      {readings.length === 0 ? (
        <View style={styles.emptyState}>
          <IconButton icon="book-open-blank-variant" size={64} style={{ opacity: 0.3 }} />
          <Text style={{ opacity: 0.5 }}>{t('common:no_history', 'No History')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReadings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  itemSurface: {
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    overflow: 'hidden',
  },
  dateBox: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  spreadTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  }
});

export default HistoryScreen;