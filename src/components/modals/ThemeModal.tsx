import React from 'react';

import { useTranslation } from 'react-i18next';
import { RadioButton, useTheme } from 'react-native-paper';

import { GlassyModal } from './GlassyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelect: (theme: string) => void;
}

export const ThemeModal = ({ visible, onClose, currentTheme, onSelect }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GlassyModal visible={visible} onClose={onClose} title={t('common:select_theme')}>
      <RadioButton.Group onValueChange={onSelect} value={currentTheme}>
        <RadioButton.Item
          label={t('common:theme_system')}
          value="system"
          color={theme.colors.primary}
        />
        <RadioButton.Item
          label={t('common:theme_light')}
          value="light"
          color={theme.colors.primary}
        />
        <RadioButton.Item
          label={t('common:theme_dark')}
          value="dark"
          color={theme.colors.primary}
        />
      </RadioButton.Group>
    </GlassyModal>
  );
};
