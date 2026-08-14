import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Translations object (can use http backend for production)
    resources: {
      es: { translation: esTranslations },
      en: { translation: enTranslations },
    },
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Browser language detection
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    // Namespaces for better organization (auth, common, map, pins, sync)
    ns: ['translation'],
  });

export default i18next;
