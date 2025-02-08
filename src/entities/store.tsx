'use client';

import { useContext, createContext } from 'react';

import { I18nProvider } from '@/shared/lib/i18n/provider';

import { SettingsStore } from './settings/model';
import { Language } from './settings/model';

import type { FC, PropsWithChildren } from 'react';

type Store = {
  settings: SettingsStore;
};

const StoreContext = createContext<Store | null>(null);

const useStore = () => {
  const globalStore = useContext(StoreContext);

  if (!globalStore) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return globalStore;
};

const StoreProvider: FC<
  PropsWithChildren<{
    initial: {
      settingsLocale: Language;
    };
  }>
> = ({ initial, children }) => {
  const store = {
    settings: new SettingsStore(initial.settingsLocale),
  };

  return (
    <I18nProvider>
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    </I18nProvider>
  );
};

export { useStore, StoreContext, StoreProvider };
