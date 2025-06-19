import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import pt from './locales/pt/translation.json';
import en from './locales/en/translation.json';

// This file initializes i18next for internationalization in a React application
i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.MODE === 'development',
    supportedLngs: ['en', 'pt'],
    fallbackLng: 'en',

    keySeparator: false, // key separator
    nsSeparator: false, // namespace separator

    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },

    parseMissingKeyHandler: (key) => key,
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

export default i18n;
