import { z } from 'zod';

import { publicUserSchema } from '../users/users.schema';

/* ----------------------------- entities ----------------------------- */

const SQUAD_NAME_MAX = 64;
const SQUAD_TAG_MAX = 16;
const SQUAD_DESCRIPTION_MAX = 1000;

const squadSchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  owner: publicUserSchema,
  /** Includes the owner. */
  members: z.array(publicUserSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/** Squad in search results / access lists. */
const squadSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  tag: z.string(),
  logo: z.string().nullable(),
  membersCount: z.number().optional(),
});

/* ----------------------------- requests ----------------------------- */

const squadFormSchema = z.object({
  name: z.string().trim().min(1, 'common:required').max(SQUAD_NAME_MAX),
  tag: z.string().trim().min(1, 'common:required').max(SQUAD_TAG_MAX),
  description: z.string().trim().max(SQUAD_DESCRIPTION_MAX),
});

const SQUAD_LOGO_MAX_SIZE = 5 * 1024 * 1024;
const SQUAD_LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const squadLogoFileSchema = z
  .custom<File>(
    (value) => typeof File !== 'undefined' && value instanceof File,
    'pages:profile:avatarInvalidType'
  )
  .refine((file) => SQUAD_LOGO_MIME_TYPES.includes(file.type), 'pages:profile:avatarInvalidType')
  .refine((file) => file.size <= SQUAD_LOGO_MAX_SIZE, 'pages:profile:avatarTooLarge');

/* ----------------------------- responses ---------------------------- */

const squadResponseSchema = squadSchema;
const squadsResponseSchema = z.array(squadSchema);
const searchSquadsResponseSchema = z.array(squadSummarySchema);

/* ------------------------------- types ------------------------------ */

type Squad = z.infer<typeof squadSchema>;
type SquadSummary = z.infer<typeof squadSummarySchema>;
type SquadForm = z.input<typeof squadFormSchema>;

export {
  squadSchema,
  squadSummarySchema,
  squadFormSchema,
  squadLogoFileSchema,
  squadResponseSchema,
  squadsResponseSchema,
  searchSquadsResponseSchema,
  SQUAD_NAME_MAX,
  SQUAD_TAG_MAX,
  SQUAD_DESCRIPTION_MAX,
  SQUAD_LOGO_MIME_TYPES,
};

export type { Squad, SquadSummary, SquadForm };
