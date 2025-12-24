import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  MD3DarkTheme, 
  MD3LightTheme, 
  Provider as PaperProvider, 
  adaptNavigationTheme 
} from 'react-native-paper';
import { 
  DarkTheme as NavigationDarkTheme, 
  DefaultTheme as NavigationDefaultTheme 
} from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/useSettingsStore';
import './src/locales/i18n'; // Initialize i18n

// custom Mystical Theme based on Material 3
const MysticalDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF', // Soft Purple
    secondary: '#CCC2DC',
    tertiary: '#EFB8C8',
    background: '#121212', // Deep black/grey
    surface: '#1E1E1E',
    elevation: {
      level1: '#252525',
    }
  },
};

const { LightTheme: NavLightTheme, DarkTheme: NavDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function App() {
  const { themeMode } = useSettingsStore();

  // force Dark for the mystical vibe, or respect system
  const isDark = themeMode === 'dark' || themeMode === 'system'; 
  const paperTheme = isDark ? MysticalDarkTheme : MD3LightTheme;
  const navTheme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}