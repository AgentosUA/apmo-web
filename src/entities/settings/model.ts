'use client';

import cookie from 'js-cookie';
import { makeObservable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { Language } from '@/shared/lib/i18n/lib';

class SettingsStore {
  private locale;

  constructor(initialLocale: Language) {
    makeObservable(this);

    this.locale = initialLocale;
    cookie.set('locale', initialLocale);
    i18n.changeLanguage(initialLocale);
  }

  getLocale = () => this.locale;

  setLocale = (locale: Language) => {
    this.locale = locale;
    cookie.set('locale', locale);
    i18n.changeLanguage(locale);
  };
}

export { SettingsStore, Language };
