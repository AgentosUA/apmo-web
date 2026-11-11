import { z } from 'zod';

import { fields } from '@/shared/lib/validation';

import { planSchema } from '../plans/plan.schema';

/* ----------------------------- entities ----------------------------- */

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  avatar: z.string().nullable(),
  squadTag: z.string().nullable(),
  plans: z.array(planSchema),
});

/* ----------------------------- requests ----------------------------- */

/** `POST /profile/change-avatar` — empty string resets to the default avatar. */
const changeAvatarRequestSchema = z.object({
  avatar: fields.optionalImageUrl(),
});

/* ----------------------------- responses ---------------------------- */

const profileResponseSchema = userSchema;
const changeAvatarResponseSchema = z.unknown();

/* ------------------------------- types ------------------------------ */

type User = z.infer<typeof userSchema>;
type ChangeAvatarRequest = z.input<typeof changeAvatarRequestSchema>;

export { userSchema, changeAvatarRequestSchema, profileResponseSchema, changeAvatarResponseSchema };

export type { User, ChangeAvatarRequest };
