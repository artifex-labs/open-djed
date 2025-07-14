import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ptTranslation from './locales/pt/translation.json'
import ptCommon from './locales/pt/common.json'
import enTranslation from './locales/en/translation.json'
import enCommon from './locales/en/common.json'

// This file initializes i18next for internationalization in a React application
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.MODE === 'development',

    // NOVO: definir namespaces
    ns: ['common', 'translation'],
    defaultNS: 'translation',
    fallbackNS: 'common',

    supportedLngs: ['en', 'pt'],
    fallbackLng: 'en',

    keySeparator: false,
    nsSeparator: false,

    detection: {
      order: ['cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    resources: {
      en: {
        translation: enTranslation,
        common: enCommon,
      },
      pt: {
        translation: ptTranslation,
        common: ptCommon,
      },
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
    console.error('Error initializing i18n:', error)
  })

export default i18n
