import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme, Card, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../ScreenContainer';
import { CardImage } from '../../components/CardImage';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getAvailableDecks } from '../../services/deckRegistry';
import { DeckInfo } from '../../types/deck';

const DeckSelectionScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  
  const { activeDeckId, setActiveDeckId } = useSettingsStore();
  const decks = useMemo(() => getAvailableDecks(), []);

  const handleSelect = (id: string) => {
    setActiveDeckId(id);
    // Optional: Go back automatically
    // navigation.goBack(); 
  };

  const renderItem = ({ item }: { item: DeckInfo }) => {
    const isActive = item.id === activeDeckId;

    return (
      <TouchableOpacity onPress={() => handleSelect(item.id)} activeOpacity={0.8}>
        <Card style={[
          styles.card, 
          isActive && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}>
          <View style={styles.cardContent}>
            {/* Left: Card Back Preview */}
            <View style={styles.imageContainer}>
              <CardImage 
                deckId={item.id} 
                style={styles.deckImage} 
              />
            </View>

            {/* Right: Info */}
            <View style={styles.infoContainer}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {t(`decks:${item.id}.name`)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                {t(`decks:${item.id}.description`)}
              </Text>
              <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>
                {item.totalCards} {t('common:cards', 'cards')} • {item.author}
              </Text>
            </View>

            {/* Radio Button for selection status */}
            <View style={styles.radioContainer}>
              <RadioButton
                value={item.id}
                status={isActive ? 'checked' : 'unchecked'}
                onPress={() => handleSelect(item.id)}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={decks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)', // Glassmorphism-ish
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 90,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  deckImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  radioContainer: {
    marginLeft: 8,
  }
});

export default DeckSelectionScreen;