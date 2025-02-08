import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { Language } from './lib';
import czLocale from './locales/cz';
import enLocale from './locales/en';
import ukLocale from './locales/uk';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: enLocale,
      uk: ukLocale,
      cz: czLocale,
    },
    lng: Language.EN,
    // supportedLngs: [Language.EN, Language.UK, Language.CZ],
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };
