'use client';

import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';

import { mapsEntity } from '@/entities/maps';
import { userEntity } from '@/entities/user/model';

const BootProvider: FC<PropsWithChildren> = observer<PropsWithChildren>(({ children }) => {
  useEffect(() => {
    // Preload the OCAP world list so the map selector opens instantly.
    void mapsEntity.loadWorlds();
  }, []);

  useEffect(() => {
    // Asks the API whether the session cookie is valid (and loads the profile).
    void userEntity.boot();
  }, []);

  return children;
});

export { BootProvider };
