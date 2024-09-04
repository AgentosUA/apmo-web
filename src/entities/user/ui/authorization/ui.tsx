import { observable } from 'mobx';

import { FC, PropsWithChildren } from 'react';

import { userEntity } from '../../model';
import { observer } from 'mobx-react-lite';

const Authorized = observer<PropsWithChildren>(({ children }) => {
  if (!userEntity.isAuthorized) return null;

  return children;
});

const UnAuthorized = observer<PropsWithChildren>(({ children }) => {
  if (userEntity.isAuthorized) return null;

  return children;
});

export { Authorized, UnAuthorized };
