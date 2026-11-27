import cookie from 'js-cookie';
import { action, makeObservable, observable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { isLanguage, Language } from '@/shared/lib/i18n/lib';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

const LOCALE_KEY = 'locale';
const SOUND_KEY = 'notificationSound';

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

  /** Notification sounds (toasters). Stored per browser in localStorage. */
  isSoundEnabled = true;

  constructor(initialLocale?: Language) {
    makeObservable(this, {
      isSoundEnabled: observable,
      setSoundEnabled: action,
    });

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

  setSoundEnabled = (enabled: boolean) => {
    this.isSoundEnabled = enabled;
    toasterEntity.setSoundEnabled(enabled);

    try {
      window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    } catch {
      // storage can be unavailable (private mode, disabled storage)
    }
  };

  toggleSound = () => this.setSoundEnabled(!this.isSoundEnabled);

  /** Client-only: applies the sound setting saved in localStorage. */
  restoreSoundSetting = () => {
    try {
      const value = window.localStorage.getItem(SOUND_KEY);
      if (value === 'on' || value === 'off') this.setSoundEnabled(value === 'on');
    } catch {
      // storage can be unavailable (private mode, disabled storage)
    }
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
