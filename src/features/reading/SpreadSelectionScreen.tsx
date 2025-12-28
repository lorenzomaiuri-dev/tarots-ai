import React, { useMemo, useState } from 'react';

import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { IconButton, Text, useTheme } from 'react-native-paper';

// Reusable Components
import { GlassSurface } from '../../components/GlassSurface';
import { IntentionModal } from '../../components/modals/IntentionModal';
import spreadsData from '../../data/spreads.json';
import { useHaptics } from '../../hooks/useHaptics';
import { RootStackParamList } from '../../types/navigation';
import { Spread } from '../../types/reading';
import { ScreenContainer } from '../ScreenContainer';

const SpreadSelectionScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // LOCAL
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const selectableSpreads = useMemo(() => {
    return spreadsData.filter((s) => s.id !== 'daily');
  }, []);

  // 1. Open Modal
  const handleSpreadClick = (spread: Spread) => {
    haptics.light();
    setSelectedSpread(spread);
    setModalVisible(true);
  };

  // 2. Navigation after confirm
  const handleConfirmIntent = (customQuestion: string) => {
    setModalVisible(false);
    if (selectedSpread) {
      navigation.navigate('ReadingTable', {
        spreadId: selectedSpread.id,
        customQuestion: customQuestion,
      });
    }
  };

  const renderItem = ({ item }: { item: Spread }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSpreadClick(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
      >
        <GlassSurface intensity={25} style={styles.glassWrapper}>
          <View style={styles.contentRow}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primaryContainer + '40' },
              ]}
            >
              <IconButton
                icon={item.icon || 'cards-playing-outline'}
                size={26}
                iconColor={theme.colors.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.spreadName}>
                {t(`spreads:${item.id}.name`, item.id)}
              </Text>
              <Text variant="bodySmall" numberOfLines={2} style={styles.spreadDesc}>
                {t(`spreads:${item.id}.description`)}
              </Text>
            </View>

            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <Text style={[styles.countText, { color: theme.colors.primary }]}>
                  {item.slots.length}
                </Text>
                <Text style={styles.cardsLabel}>{t('common:cards', 'cards').toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </GlassSurface>
      </TouchableOpacity>
    );
  };

  // Get Default Question
  const getDefaultQuestion = () => {
    if (!selectedSpread?.defaultQuestionKey) return '';
    return t(`prompts:${selectedSpread.defaultQuestionKey}`, '');
  };

  return (
    <ScreenContainer>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t('common:select_spread', 'Choose your Spread')}
        </Text>
        <View style={[styles.headerDivider, { backgroundColor: theme.colors.primary }]} />
      </View>

      <FlatList
        data={selectableSpreads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL */}
      <IntentionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmIntent}
        defaultQuestion={getDefaultQuestion()}
        spreadName={selectedSpread ? t(`spreads:${selectedSpread.id}.name`) : ''}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerDivider: {
    height: 3,
    width: 32,
    marginTop: 8,
    borderRadius: 2,
    opacity: 0.8,
  },
  listPadding: {
    paddingVertical: 16,
    paddingBottom: 60,
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: 4,
  },
  glassWrapper: {
    borderRadius: 24,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spreadName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  spreadDesc: {
    opacity: 0.7,
    lineHeight: 16,
    fontSize: 12,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countText: {
    fontWeight: '900',
    fontSize: 14,
  },
  cardsLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    opacity: 0.5,
    marginTop: -2,
    letterSpacing: 0.5,
  },
  accentLine: {
    height: 1,
    width: '40%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    opacity: 0.2,
  },
});

export default SpreadSelectionScreen;
