'use client';

import { userEntity } from '@/entities/user/model';
import { observer } from 'mobx-react-lite';
import { FC, PropsWithChildren, useEffect } from 'react';

const BootProvider: FC<PropsWithChildren> = observer<PropsWithChildren>(
  ({ children }) => {
    useEffect(() => {
      const token = window.localStorage.getItem('token');

      if (token) {
        userEntity.isAuthorized = true;
      }

      userEntity.boot();
    }, []);

    // loader

    return children;
  }
);

export { BootProvider };
