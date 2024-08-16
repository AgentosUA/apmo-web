import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { User, userEntity } from '../../model';

const useAuthorizated = (userEntity: User) => {
  const router = useRouter();

  useEffect(() => {
    if (userEntity.isAuthorized && userEntity.booted) {
      router.push('/profile');
    }
  }, [userEntity.booted, userEntity.isAuthorized]);
};

export { useAuthorizated };
