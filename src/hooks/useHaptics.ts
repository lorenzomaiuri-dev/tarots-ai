import { useCallback } from 'react';

import { Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../store/useSettingsStore';

export const useHaptics = () => {
  const isEnabled = useSettingsStore((state) => state.preferences.hapticsEnabled);

  // Helper to check if we can run haptics
  const canHaptic = isEnabled && Platform.OS !== 'web';

  /**
   * Impact feedback: simulates physical contact.
   * Use for button presses, card flips, and physical UI interactions.
   */
  const impact = useCallback(
    (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (!canHaptic) return;

      switch (style) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'medium':
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
      }
    },
    [canHaptic]
  );

  /**
   * Notification feedback: indicates task completion or status change.
   * Use for 'Save successful', 'Error occurred', or 'AI logic finished'.
   */
  const notification = useCallback(
    (type: 'success' | 'warning' | 'error' = 'success') => {
      if (!canHaptic) return;

      switch (type) {
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'success':
        default:
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }
    },
    [canHaptic]
  );

  /**
   * Selection feedback: indicates a change in selection.
   * Use for SegmentedButtons, toggles, or scrolling through a picker.
   */
  const selection = useCallback(() => {
    if (canHaptic) {
      Haptics.selectionAsync();
    }
  }, [canHaptic]);

  return {
    impact,
    notification,
    selection,
    // Convenience aliases
    light: () => impact('light'),
    medium: () => impact('medium'),
    heavy: () => impact('heavy'),
  };
};
