import { API } from '../api';

import {
  changePasswordRequestSchema,
  changePasswordResponseSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  refreshTokenResponseSchema,
  signInRequestSchema,
  signInResponseSchema,
  signUpRequestSchema,
  signUpResponseSchema,
  type ChangePasswordRequest,
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

  forgotPassword(data: ForgotPasswordRequest) {
    return this.post('/forgot-password', {
      data,
      body: forgotPasswordRequestSchema,
      response: forgotPasswordResponseSchema,
    });
  }

  /** Exchanges the refresh token (sent as Bearer) for a new token pair. */
  refreshToken() {
    return this.post('/refresh-token', {
      response: refreshTokenResponseSchema,
      useRefreshToken: true,
      // Never retry the refresh itself — a 401 here means the session is over.
      _retry: true,
    });
  }
}

export { AuthApi };
