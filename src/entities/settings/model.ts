import cookie from 'js-cookie';
import { makeObservable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { isLanguage, Language } from '@/shared/lib/i18n/lib';

const LOCALE_KEY = 'locale';

const readStoredLocale = (): Language | undefined => {
  try {
    const value = window.localStorage.getItem(LOCALE_KEY);
    return isLanguage(value) ? value : undefined;
  } catch {
    return undefined;
  }
};

class SettingsStore {
  private locale: Language;

  /** True once the user has explicitly picked a language (cookie or localStorage). */
  isLocaleSaved: boolean;

  constructor(initialLocale?: Language) {
    makeObservable(this);

    this.locale = isLanguage(initialLocale) ? initialLocale : Language.EN;
    this.isLocaleSaved = isLanguage(initialLocale);

    i18n.changeLanguage(this.locale);
  }

  getLocale = () => this.locale;

  setLocale = (locale: Language) => {
    this.locale = locale;
    this.isLocaleSaved = true;

    cookie.set(LOCALE_KEY, locale, { expires: 365, sameSite: 'lax' });
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // storage can be unavailable (private mode, disabled storage)
    }

    i18n.changeLanguage(locale);
  };

  /**
   * Client-only: syncs cookie <-> localStorage. Returns whether a saved locale exists.
   */
  restoreSavedLocale = (): boolean => {
    if (this.isLocaleSaved) {
      // Keep localStorage in sync with the cookie the server saw.
      this.setLocale(this.locale);
      return true;
    }

    const stored = readStoredLocale();
    if (stored) {
      this.setLocale(stored);
      return true;
    }

    return false;
  };
}

export { SettingsStore, Language, isLanguage };
