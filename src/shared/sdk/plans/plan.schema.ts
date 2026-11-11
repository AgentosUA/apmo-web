import { z } from 'zod';

import { missionSchema } from '../missions/mission.schema';
import { squadSummarySchema } from '../squads/squads.schema';
import { publicUserSchema } from '../users/users.schema';

/* ----------------------------- entities ----------------------------- */

const PLAN_TITLE_MAX = 120;

const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** World class name. Lets a plan without a mission open its map. */
  world: z.string().nullable().optional(),
  /** `null` when the plan was made without uploading a mission. */
  mission: missionSchema.nullable(),
  /** JSON-serialized Sweet Markers. */
  planMarkers: z.string(),
  /** ISO dates. Missing on plans saved before the API had timestamps. */
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const ACCESS_LEVELS = ['public', 'restricted'] as const;

const accessLevelSchema = z.enum(ACCESS_LEVELS);

/** Who can read / edit: `public` = anyone with the link, `restricted` = listed users and squads. */
const accessRuleSchema = z.object({
  level: accessLevelSchema,
  users: z.array(publicUserSchema),
  squads: z.array(squadSummarySchema),
});

const planAccessSchema = z.object({
  read: accessRuleSchema,
  edit: accessRuleSchema,
});

const planPermissionsSchema = z.object({
  canRead: z.boolean(),
  canEdit: z.boolean(),
  /** Manages access, renames and deletes the plan. */
  isOwner: z.boolean(),
});

/** `GET /plans/:id` — the plan with what the current user may do. */
const planDetailsSchema = planSchema.extend({
  /** `null` for plans made without an account (anyone with the link edits them). */
  owner: publicUserSchema.nullable(),
  permissions: planPermissionsSchema,
  /** Only sent to the owner. */
  access: planAccessSchema.optional(),
});

/* ----------------------------- requests ----------------------------- */

const planIdSchema = z.object({ id: z.string().min(1) });

const createPlanRequestSchema = z.object({
  title: z.string().trim().max(PLAN_TITLE_MAX).optional(),
  world: z.string().nullable().optional(),
  planMarkers: z.string(),
  mission: missionSchema.nullable(),
});

const updatePlanRequestSchema = createPlanRequestSchema.partial();

const accessRuleRequestSchema = z.object({
  level: accessLevelSchema,
  users: z.array(z.string()),
  squads: z.array(z.string()),
});

const updatePlanAccessRequestSchema = z.object({
  read: accessRuleRequestSchema,
  edit: accessRuleRequestSchema,
});

/** Save dialog: plan name. */
const savePlanFormSchema = z.object({
  title: z.string().trim().min(1, 'common:required').max(PLAN_TITLE_MAX),
});

/* ----------------------------- responses ---------------------------- */

const planResponseSchema = planDetailsSchema;

const deletePlanResponseSchema = z.unknown();

/* ------------------------------- types ------------------------------ */

type Plan = z.infer<typeof planSchema>;
type PlanDetails = z.infer<typeof planDetailsSchema>;
type PlanPermissions = z.infer<typeof planPermissionsSchema>;
type PlanAccess = z.infer<typeof planAccessSchema>;
type AccessLevel = z.infer<typeof accessLevelSchema>;
type PlanId = z.infer<typeof planIdSchema>;
type CreatePlanRequest = z.input<typeof createPlanRequestSchema>;
type UpdatePlanRequest = z.input<typeof updatePlanRequestSchema>;
type UpdatePlanAccessRequest = z.input<typeof updatePlanAccessRequestSchema>;
type SavePlanForm = z.input<typeof savePlanFormSchema>;

export {
  ACCESS_LEVELS,
  PLAN_TITLE_MAX,
  planSchema,
  planDetailsSchema,
  planAccessSchema,
  planPermissionsSchema,
  planIdSchema,
  createPlanRequestSchema,
  updatePlanRequestSchema,
  updatePlanAccessRequestSchema,
  savePlanFormSchema,
  planResponseSchema,
  deletePlanResponseSchema,
};

export type {
  Plan,
  PlanDetails,
  PlanPermissions,
  PlanAccess,
  AccessLevel,
  PlanId,
  CreatePlanRequest,
  UpdatePlanRequest,
  UpdatePlanAccessRequest,
  SavePlanForm,
};
