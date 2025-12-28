import React, { useState } from 'react';

import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';

import { useTranslation } from 'react-i18next';
import { List, Switch, Text, useTheme } from 'react-native-paper';

import { SettingSection } from '../..//components/SettingSection';
import { AIConfigModal } from '../..//components/modals/AIConfigModal';
import { SettingRow } from '../../components/SettingRow';
import { AboutModal } from '../../components/modals/AboutModal';
// Modals
import { LanguageModal } from '../../components/modals/LanguageModal';
import { ResetModal } from '../../components/modals/ResetModal';
import { ThemeModal } from '../../components/modals/ThemeModal';
// Hooks & Logic
import { useHaptics } from '../../hooks/useHaptics';
import i18n from '../../locales/i18n';
import { AppInfoService, ChangelogEntry } from '../../services/appInfo';
import { BackupService } from '../../services/backup';
import { NotificationService } from '../../services/notifications';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ScreenContainer } from '../ScreenContainer';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();

  const { preferences, updatePreferences, aiConfig, setAiConfig, resetAllSettings } =
    useSettingsStore();
  const { clearHistory } = useHistoryStore();

  const [modalState, setModalState] = useState({
    lang: false,
    theme: false,
    ai: false,
    reset: false,
    about: false,
  });
  const [changelogData, setChangelogData] = useState<{ data: ChangelogEntry[]; loading: boolean }>({
    data: [],
    loading: false,
  });

  // HANDLERS
  const handleExport = async () => {
    haptics.impact('medium');
    try {
      const data = {
        history: useHistoryStore.getState().readings,
        version: 1,
        exportDate: new Date().toISOString(),
      };
      await BackupService.exportJson(data, 'tarot_journal_backup.json');
      haptics.notification('success');
    } catch (e) {
      console.error(e);
      Alert.alert(t('common:error'), t('common:error_backup'));
    }
  };

  const handleImport = async () => {
    haptics.impact('medium');
    try {
      const parsed = await BackupService.importJson<{ history: any[] }>();
      if (!parsed) return;

      Alert.alert(
        t('common:restore'),
        `${t('common:found')} ${parsed.history.length} ${t('common:readings')}.`,
        [
          { text: t('common:cancel'), style: 'cancel' },
          {
            text: t('common:restore'),
            style: 'destructive',
            onPress: () => {
              useHistoryStore.setState({ readings: parsed.history });
              haptics.notification('success');
              Alert.alert(t('common:success'), t('common:success_message_backup'));
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert(t('common:error'), t('common:error_invalid_file'));
    }
  };
  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          t('common:biometrics_error_title', 'Not Available'),
          t(
            'common:biometrics_error_desc',
            "Your device does not support biometrics or you haven't configured fingerprint/face."
          )
        );
        return;
      }

      // Test
      const test = await LocalAuthentication.authenticateAsync({
        promptMessage: t('common:biometrics_confirm', 'Confirm Identiy'),
      });

      if (!test.success) return;
    }

    haptics.selection();
    updatePreferences({ biometricsEnabled: value });
  };

  const toggleReminder = async (val: boolean) => {
    if (val) {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        await NotificationService.scheduleDailyReminder(
          8,
          30,
          t('common:notification_title'),
          t('common:notification_message')
        );
        updatePreferences({ notificationsEnabled: true });
        haptics.notification('success');
      } else {
        Alert.alert(t('common:permissions_denied'), t('common:enable_notifications_prompt'));
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      updatePreferences({ notificationsEnabled: false });
    }
  };

  const openAbout = async () => {
    haptics.impact('light');
    setModalState((prev) => ({ ...prev, about: true }));
    if (changelogData.data.length === 0) {
      setChangelogData((prev) => ({ ...prev, loading: true }));
      const data = await AppInfoService.getChangelog();
      setChangelogData({ data, loading: false });
    }
  };

  const factoryReset = () => {
    haptics.notification('error');
    clearHistory();
    resetAllSettings();
    setModalState((prev) => ({ ...prev, reset: false }));
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.pageTitle}>
            {t('common:settings')}
          </Text>
          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </View>

        <SettingSection label={t('common:reading')}>
          <SettingRow
            title={t('common:allow_reversed_cards')}
            leftIcon="rotate-3d-variant"
            right={() => (
              <Switch
                value={preferences.allowReversed}
                onValueChange={(v) => updatePreferences({ allowReversed: v })}
              />
            )}
          />
          <SettingRow
            title={t('common:only_major_arcana', 'Only Major Arcana')}
            description={t('common:major_only_desc', 'Focus only on the 22 Greater Secrets')}
            leftIcon="star-shooting-outline"
            right={() => (
              <Switch
                value={preferences.onlyMajorArcana}
                onValueChange={(val) => {
                  haptics.selection();
                  updatePreferences({ onlyMajorArcana: val });
                }}
              />
            )}
          />
          <SettingRow
            title={t('common:morning_ritual')}
            leftIcon="bell-ring-outline"
            right={() => (
              <Switch value={preferences.notificationsEnabled} onValueChange={toggleReminder} />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:appearance')}>
          <SettingRow
            title={t('common:theme')}
            leftIcon="palette-outline"
            description={t(`common:theme_${preferences.theme}`)}
            onPress={() => setModalState((prev) => ({ ...prev, theme: true }))}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
          />
          <SettingRow
            title={t('common:language')}
            leftIcon="translate"
            description={preferences.language === 'it' ? 'Italiano' : 'English'}
            onPress={() => setModalState((prev) => ({ ...prev, lang: true }))}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
          />
          <SettingRow
            title={t('common:haptics', 'Haptics')}
            description={t('common:haptics_description', 'Tactile feedback')}
            leftIcon="vibrate"
            right={() => (
              <Switch
                value={preferences.hapticsEnabled}
                onValueChange={(val) => {
                  if (val) haptics.impact('medium');
                  updatePreferences({ hapticsEnabled: val });
                }}
              />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:security_privacy')}>
          <SettingRow
            title={t('common:biometric_lock', 'Biometric Lock')}
            description={t('common:biometric_desc', 'Protect your Journal with FaceID/Fingerprint')}
            leftIcon="fingerprint"
            right={() => (
              <Switch
                value={preferences.biometricsEnabled}
                onValueChange={handleToggleBiometrics}
              />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:ai')}>
          <SettingRow
            title={t('common:ai_provider_config')}
            leftIcon="auto-fix"
            description={aiConfig.modelId}
            onPress={() => setModalState((prev) => ({ ...prev, ai: true }))}
            right={(props: any) => <List.Icon {...props} icon="cog-outline" />}
          />
          <SettingRow
            title={t('common:get_api_key_title', 'Acquire Key')}
            description="OpenRouter.ai"
            leftIcon="key-outline"
            onPress={() => Linking.openURL('https://openrouter.ai/keys')}
            right={(props: any) => <List.Icon {...props} icon="open-in-new" />}
          />
        </SettingSection>

        <SettingSection label={t('common:chronicles')}>
          <SettingRow
            title={t('common:export_backup', 'Seal Memories')}
            leftIcon="book-arrow-up-outline"
            onPress={handleExport}
          />
          <SettingRow
            title={t('common:import_backup', 'Restore Spirits')}
            leftIcon="book-arrow-down-outline"
            onPress={handleImport}
          />
        </SettingSection>

        <SettingSection label={t('common:danger_zone')} isDestructive>
          <SettingRow
            title={t('common:factory_reset')}
            description={t('common:factory_reset_desc', 'Wipe all memories and reset settings')}
            leftIcon="alert-octagon-outline"
            destructive
            onPress={() => setModalState((prev) => ({ ...prev, reset: true }))}
          />
        </SettingSection>

        <TouchableOpacity onPress={openAbout} style={styles.versionFooter}>
          <Text style={styles.versionText}>
            {t('common:app_name')} — {AppInfoService.getFullVersionString()}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODALS COMPONENTS */}
      <LanguageModal
        visible={modalState.lang}
        currentLang={preferences.language}
        onClose={() => setModalState((prev) => ({ ...prev, lang: false }))}
        onSelect={(l) => {
          i18n.changeLanguage(l);
          updatePreferences({ language: l });
          setModalState((prev) => ({ ...prev, lang: false }));
        }}
      />

      <ThemeModal
        visible={modalState.theme}
        currentTheme={preferences.theme}
        onClose={() => setModalState((prev) => ({ ...prev, theme: false }))}
        onSelect={(t) => {
          updatePreferences({ theme: t as any });
          setModalState((prev) => ({ ...prev, theme: false }));
        }}
      />

      <AIConfigModal
        visible={modalState.ai}
        config={aiConfig}
        onClose={() => setModalState((prev) => ({ ...prev, ai: false }))}
        onSave={(conf) => {
          setAiConfig(conf);
          setModalState((prev) => ({ ...prev, ai: false }));
          haptics.notification('success');
        }}
      />

      <ResetModal
        visible={modalState.reset}
        onClose={() => setModalState((prev) => ({ ...prev, reset: false }))}
        onConfirm={factoryReset}
      />

      <AboutModal
        visible={modalState.about}
        changelog={changelogData.data}
        isLoading={changelogData.loading}
        onClose={() => setModalState((prev) => ({ ...prev, about: false }))}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  headerContainer: { marginTop: 20, marginBottom: 30 },
  pageTitle: { fontFamily: 'serif', fontWeight: 'bold' },
  accentLine: { height: 1, width: 40, marginTop: 12, opacity: 0.5 },
  versionFooter: { marginTop: 30, alignItems: 'center', paddingBottom: 20 },
  versionText: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default SettingsScreen;
