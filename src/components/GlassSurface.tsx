import React from 'react';

import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';

import { useTheme } from 'react-native-paper';

interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export const GlassSurface = ({ children, style, intensity = 30 }: GlassSurfaceProps) => {
  const theme = useTheme();

  const flattenedStyle = StyleSheet.flatten(style);
  const borderRadius = flattenedStyle?.borderRadius;

  // Define glass colors based on theme
  const backgroundColor = theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)';

  const borderColor = theme.dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)';

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={theme.dark ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor,
            borderColor,
            borderWidth: 1,
            borderRadius: flattenedStyle?.borderRadius ?? 20,
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
