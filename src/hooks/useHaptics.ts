import { useCallback } from 'react';

import { Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../store/useSettingsStore';

export const useHaptics = () => {
  const isEnabled = useSettingsStore((state) => state.preferences.hapticsEnabled);

  const light = useCallback(() => {
    if (isEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isEnabled]);

  const medium = useCallback(() => {
    if (isEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isEnabled]);

  const heavy = useCallback(() => {
    if (isEnabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isEnabled]);

  return { light, medium, heavy };
};
