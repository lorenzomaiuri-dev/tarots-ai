import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import 'intl-pluralrules'; // Polyfill for Android

import itCommon from './it/common.json';
import itRider from './it/rider-waite.json';
import itSpreads from './it/spreads.json';
import itPrompts from './it/prompts.json';
import enCommon from './en/common.json';
import enRider from './en/rider-waite.json';
import enSpreads from './en/spreads.json';
import enPrompts from './en/prompts.json';

// TODO: i18n.addResourceBundle dynamically

const resources = {
  it: {
    common: itCommon,
    'rider-waite': itRider,
    spreads: itSpreads,
    prompts: itPrompts,
  },
  en: {
    common: enCommon,
    'rider-waite': enRider,
    spreads: enSpreads,
    prompts: enPrompts,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLocales()[0].languageCode ?? 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    ns: ['common', 'rider-waite', 'spreads'],
    defaultNS: 'common',
  });

export default i18n;