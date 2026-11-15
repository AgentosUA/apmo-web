import { makeAutoObservable } from 'mobx';

import {
  api,
  getApiErrorMessage,
  tokenStorage,
  type AuthProvider,
  type AuthTokens,
  type ChangePasswordRequest,
  type ChangeUsernameRequest,
  type SetPasswordRequest,
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

  /** Sign-in methods configured on the server; null until loaded. */
  providers: AuthProvider[] | null = null;

  /** Provider being linked / unlinked in the profile. */
  pendingProvider: AuthProvider | null = null;

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

  /** First password of a user who signed up with Google / Steam / VTG. */
  setPassword = async (values: SetPasswordRequest) => {
    try {
      this.isLoadingChangePassword = true;
      await api.auth.setPassword(values);

      if (this.user) this.user.hasPassword = true;
    } finally {
      this.isLoadingChangePassword = false;
    }
  };

  /** Loads once; an unreachable API just means no external sign-in buttons. */
  loadProviders = async () => {
    if (this.providers) return;

    try {
      const { providers } = await api.auth.oauthProviders();

      this.providers = providers;
    } catch {
      this.providers = [];
    }
  };

  /** Sends the browser to the provider; it comes back to `/auth/callback`. Throws on failure. */
  linkProvider = async (provider: AuthProvider, lang?: string) => {
    try {
      this.pendingProvider = provider;

      const { url } = await api.auth.oauthLink(provider, lang);

      window.location.assign(url);
    } catch (error) {
      this.pendingProvider = null;
      throw error;
    }
  };

  /** Throws on failure (e.g. the last sign-in method). */
  unlinkProvider = async (provider: AuthProvider) => {
    try {
      this.pendingProvider = provider;

      await api.auth.oauthUnlink(provider);

      if (this.user?.accounts) {
        this.user.accounts = this.user.accounts.filter((account) => account.provider !== provider);
      }
    } finally {
      this.pendingProvider = null;
    }
  };

  /** Throws on failure (e.g. the nickname is taken) so the form can show the error. */
  changeUsername = async (values: ChangeUsernameRequest) => {
    const { username } = await api.profile.changeUsername(values);

    if (this.user) {
      this.user.username = username;
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

  /** Tokens received from an external sign-in (`/auth/callback`). */
  loginWithTokens = (tokens: AuthTokens) => {
    tokenStorage.set(tokens);

    this.isAuthorized = true;
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
