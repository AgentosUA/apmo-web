import { apmoApi, LoginDto, User as UserType } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  booted = false;

  constructor() {
    makeAutoObservable(this);
  }

  boot = () => {
    this.booted = true;
  };

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

  logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    this.isAuthorized = false;
  };
}

const userEntity = new User();

export { User, userEntity };
