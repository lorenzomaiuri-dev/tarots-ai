import React, { useRef, useState, useLayoutEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, useTheme, Divider, Surface, TextInput } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { IconButton } from 'react-native-paper';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { CardImage } from '../../components/CardImage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DetailRouteProp = RouteProp<RootStackParamList, 'ReadingDetail'>;

const ReadingDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { readings, updateUserNotes } = useHistoryStore();
  const reading = readings.find(r => r.id === route.params.readingId);
  if (!reading) return null;
  const viewShotRef = useRef(null);
  const [notes, setNotes] = useState(reading.userNotes || '');
  const [isEditing, setIsEditing] = useState(false);    

  const dateStr = new Date(reading.timestamp).toLocaleString();

  const handleSaveNotes = () => {
    updateUserNotes(reading.id, notes);
    setIsEditing(false);
  };


  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        // 1. Get Image
        const uri = await captureRef(viewShotRef.current, {
          format: 'jpg',
          quality: 0.8,
          result: 'tmpfile' // Save in cache
        });

        // 2. Open Share Dialog
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: t('common:share_reading_message', 'Share your reading')
          });
        }
      }
    } catch (e) {
      console.error("Error sharing", e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton icon="share-variant" onPress={handleShare} />
      )
    });
  }, [navigation]);
  

  return (
    <ScreenContainer>
      <ViewShot 
        ref={viewShotRef} 
        options={{ format: 'jpg', quality: 0.9 }} 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {t(`spreads:${reading.spreadId}.name`)}
          </Text>
          <Text variant="bodyMedium" style={{ opacity: 0.6, marginTop: 4 }}>
            {dateStr}
          </Text>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        {/* CARDS GRID (Simple Layout) */}
        <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
           {t('common:drawn_cards', 'Drawn cards')}
        </Text>
        
        <View style={styles.cardsContainer}>
          {reading.cards.map((drawn, index) => (
            <View key={index} style={styles.cardRow}>
              {/* Image Thumbnail */}
              <View style={styles.cardImageWrapper}>
                 <CardImage 
                   deckId={reading.deckId} 
                   cardId={drawn.cardId} 
                   style={[
                     styles.cardImage, 
                     drawn.isReversed && { transform: [{ rotate: '180deg' }] }
                   ]} 
                 />
              </View>

              {/* Text Info */}
              <View style={styles.cardInfo}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                  {t(`spreads:${reading.spreadId}.positions.${drawn.positionId}.label`)}
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {t(`decks:${reading.deckId}.cards.${drawn.cardId}.name`)}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {drawn.isReversed ? t('common:reversed', 'Reversed') : t('common:upright', 'Upright')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        {/* AI INTERPRETATION */}
        {reading.aiInterpretation ? (
          <Surface style={[styles.aiSurface, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold', color: theme.colors.tertiary }}>
              {t('common:interpretation', 'Interpretation')}
            </Text>
            <Markdown style={{ 
                body: { color: theme.colors.onSurface, fontSize: 16, lineHeight: 24 } 
            }}>
              {reading.aiInterpretation}
            </Markdown>
          </Surface>
        ) : (
           <Text style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>
             {t('common:no_interpretation', 'No interpretation found')}
           </Text>
        )}
        <Text style={{ textAlign: 'center', opacity: 0.3, marginTop: 20, fontSize: 10 }}>
             {t('common:ai_tarots_bottomline', 'By AI Tarots')}
        </Text>

        <Divider style={{ marginVertical: 24 }} />

        <View style={styles.notesSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
              {t('common:notes_title', 'Your notes')}
            </Text>
            {!isEditing ? (
              <IconButton icon="pencil" size={20} onPress={() => setIsEditing(true)} />
            ) : (
              <IconButton icon="check" size={20} iconColor={theme.colors.primary} onPress={handleSaveNotes} />
            )}
          </View>

          {isEditing ? (
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('common:write_here', 'Write here')}
              style={{ backgroundColor: theme.colors.elevation.level1 }}
            />
          ) : (
            <Surface style={[styles.aiSurface, { backgroundColor: theme.colors.elevation.level1, minHeight: 100 }]}>
              {notes ? (
                <Text style={{ fontSize: 16, lineHeight: 24, color: theme.colors.onSurface }}>
                  {notes}
                </Text>
              ) : (
                <Text style={{ opacity: 0.5, fontStyle: 'italic' }}>
                  {t('common:no_notes', 'No Notes found')}
                </Text>
              )}
            </Surface>
          )}
        </View>
      </ScrollView>
      </ViewShot>      
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImageWrapper: {
    width: 60,
    height: 100,
    marginRight: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  cardInfo: {
    flex: 1,
  },
  aiSurface: {
    padding: 16,
    borderRadius: 12,
  }
});

export default ReadingDetailScreen;