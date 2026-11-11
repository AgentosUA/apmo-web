import { z } from 'zod';

import { fields } from '@/shared/lib/validation';

/* ----------------------------- requests ----------------------------- */

/** `POST /auth/sign-in` — `email` accepts either an email or a username. */
const signInRequestSchema = z.object({
  email: fields.requiredString(),
  password: fields.password(),
});

/** `POST /auth/sign-up` */
const signUpRequestSchema = z.object({
  email: fields.email(),
  username: fields.requiredString(),
  password: fields.password(),
});

/** `POST /auth/change-password` */
const changePasswordRequestSchema = z.object({
  oldPassword: fields.password(),
  newPassword: fields.password(),
});

/** `POST /auth/forgot-password` */
const forgotPasswordRequestSchema = z.object({
  email: fields.email(),
});

/* ----------------------------- responses ---------------------------- */

const authTokensSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

const signInResponseSchema = authTokensSchema;
const refreshTokenResponseSchema = authTokensSchema;
const signUpResponseSchema = z.unknown();
const changePasswordResponseSchema = z.unknown();
const forgotPasswordResponseSchema = z.unknown();

/* ------------------------------- types ------------------------------ */

type SignInRequest = z.input<typeof signInRequestSchema>;
type SignUpRequest = z.input<typeof signUpRequestSchema>;
type ChangePasswordRequest = z.input<typeof changePasswordRequestSchema>;
type ForgotPasswordRequest = z.input<typeof forgotPasswordRequestSchema>;
type AuthTokens = z.infer<typeof authTokensSchema>;

export {
  signInRequestSchema,
  signUpRequestSchema,
  changePasswordRequestSchema,
  forgotPasswordRequestSchema,
  authTokensSchema,
  signInResponseSchema,
  refreshTokenResponseSchema,
  signUpResponseSchema,
  changePasswordResponseSchema,
  forgotPasswordResponseSchema,
};

export type {
  SignInRequest,
  SignUpRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  AuthTokens,
};
