'use client';

import { userEntity } from '@/entities/user/model';
import { instance } from '@/shared/sdk';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';

import cookieCutter from 'cookie-cutter';

const BootProvider: FC<PropsWithChildren> = observer<PropsWithChildren>(
  ({ children }) => {
    useEffect(() => {
      const token = cookieCutter.get('token');

      if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        userEntity.isAuthorized = true;
      }

      userEntity.boot();
    }, []);

    return children;
  }
);

export { BootProvider };
