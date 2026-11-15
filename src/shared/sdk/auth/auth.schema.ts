import { z } from 'zod';

import { fields } from '@/shared/lib/validation';

/* ----------------------------- requests ----------------------------- */

/** `POST /auth/sign-in` — `email` accepts either an email or a username. */
const signInRequestSchema = z.object({
  email: fields.requiredString(),
  password: fields.password(),
});

/** `POST /auth/sign-up` — `language` picks the language of emails. */
const signUpRequestSchema = z.object({
  email: fields.email(),
  username: fields.requiredString(),
  password: fields.password(),
  language: z.string().optional(),
});

/** `POST /auth/change-password` */
const changePasswordRequestSchema = z.object({
  oldPassword: fields.password(),
  newPassword: fields.password(),
});

/** Users who signed up with Google / Steam / VTG set their first password without the old one. */
const setPasswordRequestSchema = z.object({
  newPassword: fields.password(),
});

/** `POST /auth/forgot-password` */
const forgotPasswordRequestSchema = z.object({
  email: fields.email(),
  language: z.string().optional(),
});

/* ------------------------------ oauth ------------------------------- */

/** External sign-in methods. Keep in sync with the API (`AUTH_PROVIDERS`). */
const AUTH_PROVIDERS = ['google', 'steam', 'vtg'] as const;

const authProviderSchema = z.enum(AUTH_PROVIDERS);

/** `GET /auth/oauth/providers` — the ones configured on the server. */
const oauthProvidersResponseSchema = z.object({
  providers: z
    .array(z.string())
    .transform((list) =>
      list.filter((value): value is AuthProvider => AUTH_PROVIDERS.includes(value as AuthProvider))
    ),
});

/** `POST /auth/oauth/:provider/link` */
const oauthLinkResponseSchema = z.object({ url: z.string() });

const oauthUnlinkResponseSchema = z.unknown();

/** Error codes the API puts into `/auth/callback#error=`. */
const OAUTH_ERROR_CODES = [
  'cancelled',
  'invalid_state',
  'provider_error',
  'not_enabled',
  'email_in_use',
  'account_in_use',
  'provider_already_linked',
  'user_not_found',
] as const;

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
type SetPasswordRequest = z.input<typeof setPasswordRequestSchema>;
type AuthProvider = (typeof AUTH_PROVIDERS)[number];
type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[number];
type AuthTokens = z.infer<typeof authTokensSchema>;

export {
  signInRequestSchema,
  signUpRequestSchema,
  changePasswordRequestSchema,
  forgotPasswordRequestSchema,
  setPasswordRequestSchema,
  authTokensSchema,
  AUTH_PROVIDERS,
  OAUTH_ERROR_CODES,
  authProviderSchema,
  oauthProvidersResponseSchema,
  oauthLinkResponseSchema,
  oauthUnlinkResponseSchema,
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
  SetPasswordRequest,
  AuthTokens,
  AuthProvider,
  OAuthErrorCode,
};
