'use client';

import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';

import { mapsEntity } from '@/entities/maps';
import { userEntity } from '@/entities/user/model';
import { tokenStorage } from '@/shared/sdk';

const BootProvider: FC<PropsWithChildren> = observer<PropsWithChildren>(({ children }) => {
  useEffect(() => {
    // Preload the OCAP world list so the map selector opens instantly.
    void mapsEntity.loadWorlds();
  }, []);

  useEffect(() => {
    if (tokenStorage.hasToken()) {
      userEntity.isAuthorized = true;

      if (window.location.pathname === '/profile') {
        userEntity.boot();

        return;
      }

      userEntity.getUser();
    }

    userEntity.boot();
  }, []);

  return children;
});

export { BootProvider };
