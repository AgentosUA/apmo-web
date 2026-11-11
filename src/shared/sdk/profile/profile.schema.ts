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
type ProfilePlan = z.infer<typeof profilePlanSchema>;
type ProfilePlanSort = (typeof PROFILE_PLAN_SORTS)[number];
type SortOrder = (typeof SORT_ORDERS)[number];
type ChangeAvatarRequest = z.input<typeof changeAvatarRequestSchema>;
type UploadAvatarRequest = z.input<typeof uploadAvatarRequestSchema>;
type ProfilePlansQuery = z.input<typeof profilePlansQuerySchema>;
type ProfilePlansResponse = z.infer<typeof profilePlansResponseSchema>;

export {
  userSchema,
  profilePlanSchema,
  changeAvatarRequestSchema,
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
  ProfilePlan,
  ProfilePlanSort,
  SortOrder,
  ChangeAvatarRequest,
  UploadAvatarRequest,
  ProfilePlansQuery,
  ProfilePlansResponse,
};
