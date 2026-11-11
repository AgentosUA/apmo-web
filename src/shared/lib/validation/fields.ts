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

const fields = { requiredString, password, email, optionalImageUrl };

export { fields };
