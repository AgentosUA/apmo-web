'use client';

import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';

import { userEntity } from '@/entities/user/model';
import { instance } from '@/shared/sdk';
import { setTokenFromCookies } from '@/shared/sdk/lib';

const BootProvider: FC<PropsWithChildren> = observer<PropsWithChildren>(
  ({ children }) => {
    useEffect(() => {
      const isTokenExists = setTokenFromCookies(instance);

      if (isTokenExists) {
        userEntity.isAuthorized = true;

        if (window.location.pathname === '/profile') return;

        userEntity.getUser();
      }

      userEntity.boot();
    }, []);

    return children;
  }
);

export { BootProvider };
