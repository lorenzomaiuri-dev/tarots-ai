import React from 'react';

import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';

import { GlassyModal } from './GlassyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal = ({ visible, onClose, onConfirm }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GlassyModal visible={visible} onClose={onClose} title={t('common:are_you_sure')}>
      <View style={styles.container}>
        <Avatar.Icon
          size={64}
          icon="delete-forever"
          style={styles.icon}
          color={theme.colors.error}
        />
        <Text variant="bodyMedium" style={styles.text}>
          {t('common:reset_warning')}
        </Text>
        <Button
          mode="contained"
          onPress={onConfirm}
          buttonColor={theme.colors.error}
          style={styles.btn}
        >
          {t('common:confirm_erase')}
        </Button>
        <Button mode="text" onPress={onClose} textColor={theme.colors.onSurfaceVariant}>
          {t('common:cancel_erase')}
        </Button>
      </View>
    </GlassyModal>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  icon: { backgroundColor: 'transparent', marginBottom: 10 },
  text: { textAlign: 'center', marginVertical: 20, opacity: 0.8, lineHeight: 22 },
  btn: { width: '100%', borderRadius: 12, marginBottom: 10, height: 48, justifyContent: 'center' },
});
