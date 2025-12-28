import React from 'react';

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { BlurView } from 'expo-blur';

import { Text, useTheme } from 'react-native-paper';

import { useHaptics } from '../../hooks/useHaptics';
import { GlassSurface } from '../GlassSurface';

interface GlassyModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  intensity?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const GlassyModal = ({
  visible,
  onClose,
  title,
  children,
  intensity = 60,
  containerStyle,
}: GlassyModalProps) => {
  const theme = useTheme();
  const haptics = useHaptics();

  const handleClose = () => {
    haptics.impact('light');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.fullScreen}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <BlurView
            intensity={intensity}
            tint={theme.dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </TouchableOpacity>

        <View style={styles.centeredView} pointerEvents="box-none">
          <GlassSurface intensity={40} style={[styles.modalBox, containerStyle]}>
            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {title}
              </Text>
            </View>
            <View style={styles.content}>{children}</View>
          </GlassSurface>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centeredView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  closeBtn: {
    position: 'absolute',
    right: -12,
    top: -4,
  },
  content: {
    width: '100%',
  },
});
