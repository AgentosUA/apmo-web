import { apmoApi, LoginDto, User as UserType } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';
import { cookies } from 'next/headers';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  constructor() {
    makeAutoObservable(this);
  }

  login = async (values: LoginDto) => {
    try {
      const {
        data: { token, refreshToken },
      } = await apmoApi.user.login(values);

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      this.isAuthorized = true;
    } catch (error) {
      console.error(error);
    }
  };
}

const userEntity = new User();

export { userEntity };
