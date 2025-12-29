import React, { useEffect, useState } from 'react';

import { StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Button, TextInput } from 'react-native-paper';

import { DEFAULTS } from '../../constants';
import { AIModelConfig } from '../../types/ai';
import { GlassyModal } from './GlassyModal';

interface AIConfigModalProps {
  visible: boolean;
  onClose: () => void;
  config: AIModelConfig;
  onSave: (newConfig: any) => void;
}

export const AIConfigModal = ({ visible, onClose, config, onSave }: AIConfigModalProps) => {
  const { t } = useTranslation();
  const [tempApiKey, setTempApiKey] = useState(config.apiKey);
  const [tempModelId, setTempModelId] = useState(config.modelId);
  const [tempBaseUrl, setTempBaseUrl] = useState(config.baseUrl);

  useEffect(() => {
    if (visible) {
      setTempApiKey(config.apiKey || '');
      setTempModelId(config.modelId || DEFAULTS.AI_MODEL);
      setTempBaseUrl(config.baseUrl || DEFAULTS.BASE_URL);
    }
  }, [visible, config]);

  return (
    <GlassyModal visible={visible} onClose={onClose} title={t('common:ai_configuration_title')}>
      <TextInput
        label="Base URL"
        value={tempBaseUrl}
        onChangeText={setTempBaseUrl}
        mode="flat"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="API Key"
        value={tempApiKey}
        onChangeText={setTempApiKey}
        mode="flat"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Model ID"
        value={tempModelId}
        onChangeText={setTempModelId}
        mode="flat"
        style={styles.input}
        autoCapitalize="none"
      />
      <Button
        mode="contained"
        onPress={() => onSave({ apiKey: tempApiKey, modelId: tempModelId, baseUrl: tempBaseUrl })}
        style={styles.btn}
      >
        {t('common:save')}
      </Button>
    </GlassyModal>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent', marginBottom: 12 },
  btn: { marginTop: 12, borderRadius: 12 },
});
