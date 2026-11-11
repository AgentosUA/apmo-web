import { makeAutoObservable } from 'mobx';

import {
  api,
  getApiErrorMessage,
  tokenStorage,
  type ChangePasswordRequest,
  type SignInRequest,
  type User as UserType,
} from '@/shared/sdk';

import { squadsEntity } from '../squads';
import { profilePlansEntity } from './plans-model';

class User {
  user: UserType | null = null;

  isAuthorized = false;

  booted = false;

  isLoadingProfile = false;

  isLoadingLogin = false;

  isLoadingChangePassword = false;

  isUpdatingAvatar = false;

  constructor() {
    makeAutoObservable(this);
  }

  boot = () => {
    this.booted = true;
  };

  getUser = async (onError?: (message: string) => void) => {
    try {
      this.isLoadingProfile = true;
      this.user = await api.profile.me();
    } catch (error) {
      onError?.(getApiErrorMessage(error));
    } finally {
      this.isLoadingProfile = false;
    }
  };

  /** Resolves on success, throws the API error otherwise (forms map it onto fields). */
  changePassword = async (values: ChangePasswordRequest) => {
    try {
      this.isLoadingChangePassword = true;
      await api.auth.changePassword(values);
    } finally {
      this.isLoadingChangePassword = false;
    }
  };

  /** Throws on failure so the form can show the error. */
  changeAvatar = async (avatar: string) => {
    await api.profile.changeAvatar({ avatar });

    if (this.user) {
      this.user.avatar = avatar || null;
    }
  };

  /** Uploads an image file as the avatar. Throws on failure. */
  uploadAvatar = async (file: File) => {
    try {
      this.isUpdatingAvatar = true;

      const { avatar } = await api.profile.uploadAvatar({ avatar: file });

      if (this.user) {
        this.user.avatar = avatar;
      }
    } finally {
      this.isUpdatingAvatar = false;
    }
  };

  /** Resets to the default avatar. Throws on failure. */
  removeAvatar = async () => {
    try {
      this.isUpdatingAvatar = true;

      await api.profile.removeAvatar();

      if (this.user) {
        this.user.avatar = null;
      }
    } finally {
      this.isUpdatingAvatar = false;
    }
  };

  removePlan = (id: string) => {
    if (!this.user) return;

    this.user.plans = this.user.plans.filter((plan) => plan.id !== id);
  };

  /** Throws on failure so the form can show the error. */
  login = async (values: SignInRequest) => {
    try {
      this.isLoadingLogin = true;

      tokenStorage.set(await api.auth.signIn(values));

      this.isAuthorized = true;
    } finally {
      this.isLoadingLogin = false;
    }
  };

  logout = () => {
    tokenStorage.clear();

    this.user = null;
    this.isAuthorized = false;

    profilePlansEntity.reset();
    squadsEntity.reset();
  };
}

const userEntity = new User();

export { User, userEntity };
