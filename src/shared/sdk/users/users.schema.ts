import { z } from 'zod';

/* ----------------------------- entities ----------------------------- */

/** What anyone may see about a user. */
const publicUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatar: z.string().nullable(),
});

/* ----------------------------- responses ---------------------------- */

const searchUsersResponseSchema = z.array(publicUserSchema);

/* ------------------------------- types ------------------------------ */

type PublicUser = z.infer<typeof publicUserSchema>;

export { publicUserSchema, searchUsersResponseSchema };

export type { PublicUser };
