import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Text, useTheme } from 'react-native-paper';

import { GlassSurface } from './GlassSurface';

interface SettingSectionProps {
  label: string;
  children: React.ReactNode;
  isDestructive?: boolean;
}

export const SettingSection = ({ label, children, isDestructive }: SettingSectionProps) => {
  const theme = useTheme();
  const labelColor = isDestructive ? theme.colors.error : theme.colors.primary;

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={[styles.label, { color: labelColor }]}>
        {label.toUpperCase()}
      </Text>
      <GlassSurface
        intensity={12}
        style={[styles.card, isDestructive && { borderColor: theme.colors.error + '40' }]}
      >
        {children}
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: {
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.8,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
});
