import { AIModelConfig } from './ai';

export interface AppPreferences {
  allowReversed: boolean;
  onlyMajorArcana: boolean;
  animationEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface SettingsState {
  // State
  themeMode: 'light' | 'dark' | 'system';
  activeDeckId: string;
  isOnboardingCompleted: boolean;
  aiConfig: AIModelConfig;
  preferences: AppPreferences;

  // Actions
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  completeOnboarding: () => void;
  setActiveDeckId: (deckId: string) => void;
  setAiConfig: (config: Partial<AIModelConfig>) => void; // Update only API key
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
}