'use client';

import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from './config';
import { Language } from './lib';

const I18nProvider: FC<
  PropsWithChildren<{
    initLang: Language;
  }>
> = ({ children, initLang }) => {
  useEffect(() => {
    i18n.changeLanguage(initLang);
  }, [initLang]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export { I18nProvider };
