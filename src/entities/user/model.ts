import cookieCutter from 'cookie-cutter';
import { makeAutoObservable } from 'mobx';

import { Pagination } from '@/shared/model/pagination';
import { apmoApi, instance, LoginDto, User as UserType } from '@/shared/sdk';
import { setTokenFromCookies } from '@/shared/sdk/lib';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  booted = false;

  isLoadingProfile = false;

  isLoadingLogin = false;

  isLoadingChangePassword = false;

  plans = new Pagination({
    api: apmoApi.plan.getPlans,
  });

  constructor() {
    makeAutoObservable(this);
  }

  boot = () => {
    setTokenFromCookies(instance);

    this.booted = true;
  };

  getUser = async (onError?: (string: string) => void) => {
    try {
      this.isLoadingProfile = true;
      const { data } = await apmoApi.user.get();

      this.user = data;
    } catch (error: any) {
      onError?.(error?.response?.data?.message ?? 'Unknown error');
    } finally {
      this.isLoadingProfile = false;
    }
  };

  getPlans = async (onError?: (string: string) => void) => {
    try {
      this.plans.preloader.start();

      await this.plans.init({
        skip: 0,
        take: 25,
      });
    } catch (error: any) {
      onError?.(error?.response?.data?.message ?? 'Unknown error');
    } finally {
      this.plans.preloader.stop();
    }
  };

  changePassword = async (
    values: {
      oldPassword: string;
      newPassword: string;
    },
    cb?: () => void,
    onError?: (string: string) => void
  ) => {
    try {
      this.isLoadingChangePassword = true;
      await apmoApi.user.changePassword(values);

      cb?.();
    } catch (error: any) {
      onError?.(error?.response?.data?.message ?? 'Unknown error');
    } finally {
      this.isLoadingChangePassword = false;
    }
  };

  changeAvatar = async (avatar: string) => {
    try {
      await apmoApi.user.changeAvatar({ avatar });

      if (this.user) {
        this.user.avatar = avatar;
      }
    } catch (error) {
      console.error(error);
    }
  };

  login = async (values: LoginDto, onError?: (string: string) => void) => {
    try {
      this.isLoadingLogin = true;

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
    } catch (error: any) {
      onError?.(error?.response?.data?.message ?? 'Unknown error');
    } finally {
      this.isLoadingLogin = false;
    }
  };

  logout = () => {
    cookieCutter.set('token', '', {
      path: '/',
    });

    cookieCutter.set('refreshToken', '', {
      path: '/',
    });

    this.isAuthorized = false;
  };
}

const userEntity = new User();

export { User, userEntity };
