import { apmoApi, instance, LoginDto, User as UserType } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';

import cookieCutter from 'cookie-cutter';
import { setTokenFromCookies } from '@/shared/sdk/lib';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  booted = false;

  constructor() {
    makeAutoObservable(this);
  }

  boot = () => {
    setTokenFromCookies(instance);

    this.booted = true;
  };

  getUser = async () => {
    try {
      const { data } = await apmoApi.user.get();

      this.user = data;
    } catch (error) {
      console.error(error);
    }
  };

  changePassword = async (
    values: {
      oldPassword: string;
      newPassword: string;
    },
    cb?: () => void
  ) => {
    try {
      await apmoApi.user.changePassword(values);

      cb?.();
    } catch (error) {
      console.error(error);
    }
  };

  login = async (values: LoginDto) => {
    try {
      const {
        data: { token, refreshToken },
      } = await apmoApi.user.login(values);

      cookieCutter.set('token', token, {
        path: '/',
      });

      cookieCutter.set('refreshToken', refreshToken, {
        path: '/',
      });

      setTokenFromCookies(instance);

      this.isAuthorized = true;
    } catch (error) {
      console.error(error);
    }
  };

  logout = () => {
    cookieCutter.set('token', '');
    cookieCutter.set('refreshToken', '');

    this.isAuthorized = false;
  };
}

const userEntity = new User();

export { User, userEntity };
