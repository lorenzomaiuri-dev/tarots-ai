import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, IconButton, Surface } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types/navigation';
import { AI_CONFIG } from "../../constants";

import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CardImage } from '../../components/CardImage';

const HomeScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const { activeDeckId } = useSettingsStore();

  return (
    <ScreenContainer style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.greeting}>{AI_CONFIG.APP_NAME}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <IconButton 
          icon="cog-outline" 
          size={24} 
          onPress={() => navigation.navigate('Settings')} 
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* DAILY CARD WIDGET */}
        <Surface style={[styles.dailyCardSurface, { backgroundColor: theme.colors.elevation.level1 }]} elevation={2}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('common:daily_card_title', 'Daily Card')}
          </Text>
          <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.6 }}>
            {t('common:daily_card_subtitle', "Your day in a card")}
          </Text>

          <View style={styles.dailyCardPlaceholder}>
             {/* 
                TODO: Check logic if card is already drawn. 
                If yes -> Show CardImage with Seed.
                If no -> Show Back of card and "Tap to Draw"
             */}
             <CardImage 
               deckId={activeDeckId} 
               style={{ width: 120, height: 200 }} 
             />
             <Button 
                mode="contained-tonal" 
                style={{ marginTop: 16 }}
                onPress={() => console.log('Go to Daily Logic')}
             >
               {t('common:draw_daily', 'Draw Now')}
             </Button>
          </View>
        </Surface>

        {/* ACTIVE DECK INFO */}
        <View style={styles.deckSection}>
          <View style={styles.rowBetween}>
            <Text variant="titleMedium">{t('common:active_deck', 'Active Deck')}</Text>
            <Button mode="text" onPress={() => navigation.navigate('DeckSelection')}>
              {t('common:change', 'Change')}
            </Button>
          </View>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            {t(`decks:${activeDeckId}.name`)}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            icon="cards-playing-outline"
            contentStyle={{ height: 56 }}
            style={styles.actionButton}
            onPress={() => console.log('Navigate to Spread Selection')}
          >
            {t('common:new_reading', 'New Reading')}
          </Button>

          <Button 
            mode="outlined" 
            icon="history"
            style={styles.actionButton}
            onPress={() => console.log('Navigate to History')}
          >
            {t('common:history', 'History')}
          </Button>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  dailyCardSurface: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
  },
  dailyCardPlaceholder: {
    alignItems: 'center',
    marginTop: 8,
  },
  deckSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 8,
  }
});

export default HomeScreen;