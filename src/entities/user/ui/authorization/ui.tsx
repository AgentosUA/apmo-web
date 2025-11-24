import { observer } from 'mobx-react-lite';
import { PropsWithChildren } from 'react';

import { userEntity } from '../../model';

const Authorized = observer<PropsWithChildren>(({ children }) => {
  if (!userEntity.booted || !userEntity.isAuthorized) return null;

  return children;
});

const UnAuthorized = observer<PropsWithChildren>(({ children }) => {
  if (!userEntity.booted || userEntity.isAuthorized) return null;

  return children;
});

export { Authorized, UnAuthorized };
