import React from 'react';
import { View } from 'react-native';
import { Text, Button, Switch, List, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { preferences, updatePreferences } = useSettingsStore();

  return (
    <ScreenContainer>
      <List.Section>
        <List.Subheader>{t('common:reading', "Reading")}</List.Subheader>
        <List.Item
          title={t('common:allow_reversed_cards', "Allow reversed cards")}
          right={() => (
            <Switch 
              value={preferences.allowReversed} 
              onValueChange={(val) => updatePreferences({ allowReversed: val })} 
            />
          )}
        />
        <List.Item
          title={t('common:only_major_arcana', "Only Major Arcana")}
          description={t('common:only_first_22_cards', "Use only the first 22 Cards")}
          right={() => (
            <Switch 
              value={preferences.onlyMajorArcana} 
              onValueChange={(val) => updatePreferences({ onlyMajorArcana: val })} 
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>{t('common:ai', "AI")}</List.Subheader>
        <List.Item 
          title={t('common:configure_api_key', "Configure API key")}
          description={t('common:handle_connection_ai_providers', "Handle Connection to AI Providers")}
          onPress={() => console.log('Open API Modal')}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>
    </ScreenContainer>
  );
};

export default SettingsScreen;