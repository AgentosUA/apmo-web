import { z } from 'zod';

import { fields } from '@/shared/lib/validation';

import { authProviderSchema } from '../auth/auth.schema';
import { planSchema } from '../plans/plan.schema';

/* ----------------------------- entities ----------------------------- */

/** A sign-in method linked to the user. */
const linkedAccountSchema = z.object({
  provider: authProviderSchema,
  /** Name on the provider (Google email / Steam / VTG nickname). */
  name: z.string().nullable(),
  linkedAt: z.string(),
});

const userSchema = z.object({
  id: z.string(),
  /** Null for users who signed up with Steam. */
  email: z.string().nullable().optional(),
  username: z.string(),
  avatar: z.string().nullable(),
  squadTag: z.string().nullable().optional(),
  plans: z.array(planSchema),
  accounts: z.array(linkedAccountSchema).optional(),
  /** False for users who only sign in with Google / Steam / VTG. */
  hasPassword: z.boolean().optional(),
});

/** Plan as listed in the profile: the mission without units, vehicles, markers and briefing. */
const profilePlanSchema = planSchema.extend({
  mission: z
    .object({
      fileName: z.string().optional(),
      missionName: z.string(),
      island: z.string(),
      author: z.string().optional(),
      slots: z.record(z.string(), z.string()).nullable().optional(),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PROFILE_PLAN_SORTS = ['createdAt', 'updatedAt', 'missionName', 'world'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

/* ----------------------------- requests ----------------------------- */

/** `POST /profile/change-avatar` — empty string resets to the default avatar. */
const changeAvatarRequestSchema = z.object({
  avatar: fields.optionalImageUrl(),
});

/** `PATCH /profile/username` — unique ignoring case. */
const changeUsernameRequestSchema = z.object({
  username: fields.username(),
});

/** Error message of the API when the nickname belongs to someone else. */
const USERNAME_TAKEN_ERROR = 'Username is already taken';

/** Max avatar size, bytes. Keep in sync with the API. */
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const avatarFileSchema = z
  .custom<File>(
    (value) => typeof File !== 'undefined' && value instanceof File,
    'pages:profile:avatarInvalidType'
  )
  .refine((file) => AVATAR_MIME_TYPES.includes(file.type), 'pages:profile:avatarInvalidType')
  .refine((file) => file.size <= AVATAR_MAX_SIZE, 'pages:profile:avatarTooLarge');

/** `POST /profile/avatar` — multipart upload of an image. */
const uploadAvatarRequestSchema = z.object({ avatar: avatarFileSchema });

/** `GET /profile/plans` query. Empty values are dropped. */
const profilePlansQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  world: z.string().optional(),
  sort: z.enum(PROFILE_PLAN_SORTS),
  order: z.enum(SORT_ORDERS),
});

/* ----------------------------- responses ---------------------------- */

const profileResponseSchema = userSchema;
const changeAvatarResponseSchema = z.unknown();
const changeUsernameResponseSchema = z.object({ username: z.string() });
const uploadAvatarResponseSchema = userSchema.omit({ plans: true }).extend({
  plans: z.array(z.string()),
});
const removeAvatarResponseSchema = uploadAvatarResponseSchema;

const profilePlansResponseSchema = z.object({
  items: z.array(profilePlanSchema),
  /** Plans matching the filters. */
  total: z.number(),
  /** All plans of the user. */
  totalAll: z.number(),
  /** Worlds the user has plans on, regardless of the filters. */
  worlds: z.array(z.object({ name: z.string(), count: z.number() })),
});

/* ------------------------------- types ------------------------------ */

type User = z.infer<typeof userSchema>;
type LinkedAccount = z.infer<typeof linkedAccountSchema>;
type ProfilePlan = z.infer<typeof profilePlanSchema>;
type ProfilePlanSort = (typeof PROFILE_PLAN_SORTS)[number];
type SortOrder = (typeof SORT_ORDERS)[number];
type ChangeAvatarRequest = z.input<typeof changeAvatarRequestSchema>;
type ChangeUsernameRequest = z.input<typeof changeUsernameRequestSchema>;
type UploadAvatarRequest = z.input<typeof uploadAvatarRequestSchema>;
type ProfilePlansQuery = z.input<typeof profilePlansQuerySchema>;
type ProfilePlansResponse = z.infer<typeof profilePlansResponseSchema>;

export {
  userSchema,
  linkedAccountSchema,
  profilePlanSchema,
  changeAvatarRequestSchema,
  changeUsernameRequestSchema,
  changeUsernameResponseSchema,
  USERNAME_TAKEN_ERROR,
  uploadAvatarRequestSchema,
  avatarFileSchema,
  profilePlansQuerySchema,
  profileResponseSchema,
  changeAvatarResponseSchema,
  uploadAvatarResponseSchema,
  removeAvatarResponseSchema,
  profilePlansResponseSchema,
  PROFILE_PLAN_SORTS,
  SORT_ORDERS,
  AVATAR_MAX_SIZE,
  AVATAR_MIME_TYPES,
};

export type {
  User,
  LinkedAccount,
  ProfilePlan,
  ProfilePlanSort,
  SortOrder,
  ChangeAvatarRequest,
  ChangeUsernameRequest,
  UploadAvatarRequest,
  ProfilePlansQuery,
  ProfilePlansResponse,
};
