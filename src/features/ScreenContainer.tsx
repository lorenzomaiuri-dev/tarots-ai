import React from 'react';

import { StyleSheet, View, ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export const ScreenContainer: React.FC<Props> = ({ children, style, centered }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background,
        },
        centered && styles.centered,
        style,
      ]}
    >
      <LinearGradient
        colors={theme.dark ? ['#121212', '#1a1a2e', '#121212'] : ['#F5F5F5', '#E0E0FF', '#F5F5F5']}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
