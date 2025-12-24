import { AIModelConfig } from './ai';

export interface AppPreferences {
  allowReversed: boolean;
  onlyMajorArcana: boolean;
  animationEnabled: boolean;
}

export interface SettingsState {
  // State
  themeMode: 'light' | 'dark' | 'system';
  activeDeckId: string;
  aiConfig: AIModelConfig;
  preferences: AppPreferences;

  // Actions
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setActiveDeckId: (deckId: string) => void;
  setAiConfig: (config: Partial<AIModelConfig>) => void; // Update only API key
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
}