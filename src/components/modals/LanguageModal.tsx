import React from 'react';

import { useTranslation } from 'react-i18next';
import { RadioButton, useTheme } from 'react-native-paper';

import { GlassyModal } from './GlassyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentLang: string;
  onSelect: (lang: string) => void;
}

export const LanguageModal = ({ visible, onClose, currentLang, onSelect }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GlassyModal visible={visible} onClose={onClose} title={t('common:select_language')}>
      <RadioButton.Group onValueChange={onSelect} value={currentLang}>
        <RadioButton.Item label="Italiano" value="it" color={theme.colors.primary} />
        <RadioButton.Item label="English" value="en" color={theme.colors.primary} />
      </RadioButton.Group>
    </GlassyModal>
  );
};
