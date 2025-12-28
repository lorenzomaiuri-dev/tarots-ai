import React from 'react';

import { Linking, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Avatar, Button, Text, useTheme } from 'react-native-paper';

import { AppInfoService, ChangelogEntry } from '../../services/appInfo';
import { GlassyModal } from './GlassyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
  isLoading: boolean;
}

export const AboutModal = ({ visible, onClose, changelog, isLoading }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GlassyModal visible={visible} onClose={onClose} title={t('common:about_title')}>
      <View style={styles.container}>
        <Avatar.Image size={80} source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text variant="titleMedium" style={styles.appName}>
          {t('common:app_name')}
        </Text>
        <Text variant="labelSmall" style={styles.version}>
          {AppInfoService.getFullVersionString()}
        </Text>

        <View style={styles.changelogBox}>
          <Text variant="labelLarge" style={styles.changelogHeader}>
            {t('common:latest_changes')}
          </Text>
          {isLoading ? (
            <ActivityIndicator
              animating
              color={theme.colors.primary}
              style={{ marginVertical: 20 }}
            />
          ) : (
            changelog[0]?.changes.map((change, i) => (
              <View key={i} style={styles.changeItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
                <Text variant="bodySmall" style={styles.changeText}>
                  {change}
                </Text>
              </View>
            ))
          )}
        </View>

        <Button
          mode="text"
          onPress={() => Linking.openURL('https://...')}
          textColor={theme.colors.primary}
        >
          {t('common:privacy_policy')}
        </Button>
      </View>
    </GlassyModal>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  logo: { backgroundColor: 'transparent', marginBottom: 16 },
  appName: { fontFamily: 'serif', fontWeight: 'bold' },
  version: { opacity: 0.5, marginBottom: 24 },
  changelogBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  changelogHeader: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.7,
  },
  changeItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bullet: { width: 4, height: 4, borderRadius: 2, marginRight: 10 },
  changeText: { opacity: 0.8 },
});
