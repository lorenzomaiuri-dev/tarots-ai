import React, { useEffect, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { Button, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { useHaptics } from '../hooks/useHaptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (question: string) => void;
  defaultQuestion?: string;
  spreadName?: string;
}

export const IntentionModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  defaultQuestion = '',
  spreadName,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [question, setQuestion] = useState(defaultQuestion);

  const haptics = useHaptics();

  useEffect(() => {
    if (visible) {
      setQuestion(defaultQuestion);
    }
  }, [visible, defaultQuestion]);

  const handleConfirm = () => {
    haptics.notification('success');
    onConfirm(question);
    setQuestion('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Surface
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.colors.elevation.level3,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
                elevation={4}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconButton
                      icon="star-four-points-outline"
                      size={20}
                      iconColor={theme.colors.primary}
                      style={{ margin: 0 }}
                    />
                    <Text
                      variant="titleMedium"
                      style={[styles.title, { color: theme.colors.onSurface }]}
                    >
                      {t('common:set_intention', 'Intention')}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={onClose}
                    iconColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                {/* Context */}
                {spreadName && (
                  <View style={styles.subtitleContainer}>
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 1 }}
                    >
                      {spreadName.toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text
                  variant="bodyMedium"
                  style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t(
                    'common:intention_desc',
                    'Focus on your question. Be specific, but open to guidance.'
                  )}
                </Text>

                {/* Input Area */}
                <TextInput
                  mode="outlined"
                  value={question}
                  onChangeText={setQuestion}
                  placeholder={t('common:question_placeholder', 'What do I need to know about...')}
                  placeholderTextColor={theme.colors.onSurfaceDisabled}
                  textColor={theme.colors.onSurface}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  autoFocus={false}
                />

                {/* Actions */}
                <View style={styles.actions}>
                  <Button
                    mode="contained"
                    onPress={handleConfirm}
                    contentStyle={{ height: 50 }}
                    style={styles.button}
                    icon="cards-playing-outline"
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                  >
                    {t('common:begin_reading', 'Begin Reading')}
                  </Button>
                </View>
              </Surface>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  keyboardView: {
    justifyContent: 'center',
    width: '100%',
  },
  modalContainer: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -10,
    marginTop: -8,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'center',
    borderRadius: 12,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 32,
    fontFamily: 'serif',
    fontSize: 16,
  },
  actions: {
    width: '100%',
  },
  button: {
    borderRadius: 16,
  },
});
