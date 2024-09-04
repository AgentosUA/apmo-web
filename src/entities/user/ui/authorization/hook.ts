import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { User } from '../../model';

const useAuthorizated = (userEntity: User) => {
  const router = useRouter();

  useEffect(() => {
    if (userEntity.isAuthorized && userEntity.booted) {
      router.push('/profile');
    }
  }, [userEntity.booted, userEntity.isAuthorized]);
};

const useUnAuthorizated = (userEntity: User) => {
  const router = useRouter();

  useEffect(() => {
    if (!userEntity.isAuthorized && userEntity.booted) {
      router.push('/');
    }
  }, [userEntity.booted, userEntity.isAuthorized]);
};

export { useAuthorizated, useUnAuthorizated };
