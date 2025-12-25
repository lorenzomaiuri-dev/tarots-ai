import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, Button, TextInput, useTheme, Surface, IconButton, HelperText } from 'react-native-paper';
import Clipboard from 'expo-clipboard'; 
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setAiConfig, completeOnboarding } = useSettingsStore();
  
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');

  const stepsCount = 3;

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setApiKey(text);
    }
  };

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step < stepsCount - 1) {
      setStep(step + 1);
    } else {
      if (apiKey.trim()) {
        setAiConfig({ apiKey: apiKey.trim() });
      }
      completeOnboarding();
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step > 0) setStep(step - 1);
  };

  const renderStep0 = () => (
    <View style={styles.slide}>
      <IconButton 
        icon="eye-circle-outline" 
        size={100} 
        iconColor={theme.colors.primary} 
        style={styles.mainIcon}
      />
      <Text variant="displaySmall" style={styles.title}>
        {t('onboarding:welcome_title', 'Tarots AI')}
      </Text>
      <Text variant="titleMedium" style={styles.subtitle}>
        {t('onboarding:welcome_subtitle', 'Introspection, not prediction.')}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {t('onboarding:welcome_description', 'Explore the archetypes and connect with yourself through the Tarots language.')}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.slide}>
      <IconButton icon="key-variant" size={60} iconColor={theme.colors.secondary} />
      <Text variant="headlineMedium" style={styles.title}>
        {t('onboarding:api_title', 'Il Motore AI')}
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        {t('onboarding:api_description', "Insert an API Key (OpenRouter or any OpenAI-Compatible) to unlock intelligent insights.")}
      </Text>
      
      <Surface style={[styles.inputContainer, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
        <TextInput
          label={t('onboarding:api_label', 'API Key')}
          value={apiKey}
          onChangeText={setApiKey}
          mode="outlined"
          secureTextEntry
          placeholder="sk-or-v1..."
          right={<TextInput.Icon icon="content-paste" onPress={handlePaste} />}
        />
        <Button 
          mode="text" 
          onPress={() => Linking.openURL('https://openrouter.ai/keys')}
          style={{ marginTop: 8 }}
        >
          {t('onboarding:get_key', 'Get a FREE API Key')}
        </Button>
      </Surface>

      <HelperText type="info" style={{ textAlign: 'center', marginTop: 10 }}>
        {t('onboarding:api_skip_note', 'Or do it later in the settings.')}
      </HelperText>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.slide}>
      <IconButton icon="cards-playing-outline" size={100} iconColor={theme.colors.tertiary} />
      <Text variant="headlineMedium" style={styles.title}>
        {t('onboarding:ready_title', 'All ready!')}
      </Text>
      <View style={styles.readyTextContainer}>
        <Text variant="headlineSmall" style={styles.italicText}>
          {t('onboarding:ready_msg_1', 'The deck has been shuffled.')}
        </Text>
        <Text variant="headlineSmall" style={styles.italicText}>
          {t('onboarding:ready_msg_2', 'The Journal is open.')}
        </Text>
      </View>
      <Text variant="bodyLarge" style={[styles.description, { marginTop: 20 }]}>
        {t('onboarding:ready_action', 'Get ready yo extract your first card.')}
      </Text>
    </View>
  );

  return (
    <ScreenContainer centered style={{ paddingHorizontal: 28 }}>
      <View style={styles.content}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {step > 0 ? (
            <Button mode="text" onPress={handleBack} style={styles.navButton}>
              {t('common:back', 'Indietro')}
            </Button>
          ) : <View style={styles.navButton} />}

          <Button 
            mode="contained" 
            onPress={handleNext} 
            style={[styles.navButton, styles.nextButton]}
            contentStyle={{ height: 50 }}
          >
            {step === stepsCount - 1 ? t('onboarding:start', 'Inizia') : t('common:next', 'Avanti')}
          </Button>
        </View>

        {/* Indicators */}
        <View style={styles.dotsContainer}>
          {[...Array(stepsCount)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { 
                  backgroundColor: i === step ? theme.colors.primary : theme.colors.outlineVariant,
                  width: i === step ? 20 : 8, // Expansion effect
                }
              ]} 
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  slide: {
    alignItems: 'center',
    width: '100%',
  },
  mainIcon: {
    marginBottom: 0,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  readyTextContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  italicText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  inputContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: 25,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default OnboardingScreen;