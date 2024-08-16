import { apmoApi, instance, LoginDto, User as UserType } from '@/shared/sdk';

import { makeAutoObservable } from 'mobx';

import cookieCutter from 'cookie-cutter';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  booted = false;

  constructor() {
    makeAutoObservable(this);
  }

  boot = () => {
    const token = cookieCutter.get('token');

    instance.defaults.headers.head.Authorization = `Bearer ${token}`;

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
