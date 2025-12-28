import React from 'react';

import { StyleSheet } from 'react-native';

import { List, useTheme } from 'react-native-paper';

interface SettingRowProps {
  title: string;
  description?: string;
  leftIcon: string;
  right?: (props: any) => React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

export const SettingRow = ({
  title,
  description,
  leftIcon,
  right,
  onPress,
  destructive,
}: SettingRowProps) => {
  const theme = useTheme();

  return (
    <List.Item
      title={title}
      description={description}
      onPress={onPress}
      titleStyle={[styles.title, destructive && { color: theme.colors.error }]}
      descriptionStyle={styles.desc}
      left={(props) => (
        <List.Icon
          {...props}
          icon={leftIcon}
          color={destructive ? theme.colors.error : theme.colors.primary}
        />
      )}
      right={right}
      style={styles.item}
    />
  );
};

const styles = StyleSheet.create({
  item: { paddingVertical: 4 },
  title: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 12, opacity: 0.5 },
});
