import { z } from 'zod';

/**
 * Reusable zod field builders.
 *
 * Error messages are i18n keys — they are translated where they are rendered
 * (see `Input` / `FormAlert`), so the same schema works for every language.
 */
const requiredString = () => z.string().trim().min(1, 'common:required');

/** Required, not trimmed — whitespace in passwords is significant. */
const password = () => z.string().min(1, 'common:required');

const email = () =>
  z.string().trim().min(1, 'common:required').pipe(z.email('common:notValidEmail'));

const IMAGE_URL_RE = /\.(jpe?g|gif|png|webp)$/i;

/** Empty string (no image) or an absolute URL to a jpg/gif/png/webp file. */
const optionalImageUrl = () =>
  z.union([
    z.literal(''),
    z.url('pages:profile:invalidAvatarUrl').regex(IMAGE_URL_RE, 'pages:profile:invalidAvatarUrl'),
  ]);

const USERNAME_MIN = 3;
const USERNAME_MAX = 24;

/** Letters of any script, digits, space and `_ . - [ ]` (no `@`). Keep in sync with the API. */
const USERNAME_RE = /^[\p{L}\p{N}_.\-[\] ]+$/u;

/** Nickname: normalized like on the API (NFKC, single spaces, trimmed). */
const username = () =>
  z
    .string()
    .transform((value) => value.normalize('NFKC').replace(/\s+/g, ' ').trim())
    .pipe(
      z
        .string()
        .min(1, 'common:required')
        .min(USERNAME_MIN, 'pages:profile:username:tooShort')
        .max(USERNAME_MAX, 'pages:profile:username:tooLong')
        .regex(USERNAME_RE, 'pages:profile:username:invalid')
    );

const fields = { requiredString, password, email, optionalImageUrl, username };

export { fields, USERNAME_MAX, USERNAME_MIN };
