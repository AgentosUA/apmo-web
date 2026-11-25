import { API } from '../api';

import {
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  logoutResponseSchema,
  oauthLinkResponseSchema,
  oauthProvidersResponseSchema,
  oauthUnlinkResponseSchema,
  refreshTokenResponseSchema,
  setPasswordRequestSchema,
  signInRequestSchema,
  signInResponseSchema,
  signUpRequestSchema,
  signUpResponseSchema,
  type AuthProvider,
  type ChangePasswordRequest,
  type SetPasswordRequest,
  type ForgotPasswordRequest,
  type SignInRequest,
  type SignUpRequest,
} from './auth.schema';

class AuthApi extends API {
  constructor() {
    super('/auth');
  }

  signIn(data: SignInRequest) {
    return this.post('/sign-in', {
      data,
      body: signInRequestSchema,
      response: signInResponseSchema,
    });
  }

  signUp(data: SignUpRequest) {
    return this.post('/sign-up', {
      data,
      body: signUpRequestSchema,
      response: signUpResponseSchema,
    });
  }

  changePassword(data: ChangePasswordRequest) {
    return this.post('/change-password', {
      data,
      body: changePasswordRequestSchema,
      response: changePasswordResponseSchema,
    });
  }

  /** First password for a user who signed up with Google / Steam / VTG. */
  setPassword(data: SetPasswordRequest) {
    return this.post('/change-password', {
      data,
      body: setPasswordRequestSchema,
      response: changePasswordResponseSchema,
    });
  }

  forgotPassword(data: ForgotPasswordRequest) {
    return this.post('/forgot-password', {
      data,
      body: forgotPasswordRequestSchema,
      response: forgotPasswordResponseSchema,
    });
  }

  /** Sign-in methods configured on the server. */
  oauthProviders() {
    return this.get('/oauth/providers', { response: oauthProvidersResponseSchema });
  }

  /**
   * Browser URL that starts signing in with `provider`. The API redirects to
   * the provider and back to `/auth/callback`.
   */
  getOAuthLoginUrl(provider: AuthProvider, lang?: string) {
    const url = new URL(
      `${this.http.defaults.baseURL}${this.basePath}/oauth/${provider}`,
      typeof window === 'undefined' ? 'http://localhost' : window.location.origin
    );

    if (lang) url.searchParams.set('lang', lang);

    return url.toString();
  }

  /** URL that links `provider` to the signed-in user (open it in the browser). */
  oauthLink(provider: AuthProvider, lang?: string) {
    return this.post(`/oauth/${provider}/link`, {
      params: lang ? { lang } : undefined,
      response: oauthLinkResponseSchema,
    });
  }

  oauthUnlink(provider: AuthProvider) {
    return this.delete(`/oauth/${provider}`, { response: oauthUnlinkResponseSchema });
  }

  /** Renews the session cookies using the `apmo_refresh` cookie. */
  refreshToken() {
    return this.post('/refresh-token', {
      response: refreshTokenResponseSchema,
      // Never retry the refresh itself — a 401 here means the session is over.
      _retry: true,
    });
  }

  /** Clears the session cookies. Works with an expired session too. */
  logout() {
    return this.post('/logout', {
      response: logoutResponseSchema,
      _retry: true,
    });
  }
}

export { AuthApi };
