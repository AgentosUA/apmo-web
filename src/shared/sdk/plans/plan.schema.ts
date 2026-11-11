import { z } from 'zod';

import { missionSchema } from '../missions/mission.schema';

/* ----------------------------- entities ----------------------------- */

const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** `null` when the plan was made without uploading a mission. */
  mission: missionSchema.nullable(),
  /** JSON-serialized Sweet Markers. */
  planMarkers: z.string(),
});

/* ----------------------------- requests ----------------------------- */

const planIdSchema = z.object({ id: z.string().min(1) });

const createPlanRequestSchema = z.object({
  title: z.string(),
  planMarkers: z.string(),
  mission: missionSchema.nullable(),
});

const updatePlanRequestSchema = createPlanRequestSchema;

/* ----------------------------- responses ---------------------------- */

const planResponseSchema = planSchema;

const deletePlanResponseSchema = z.unknown();

/* ------------------------------- types ------------------------------ */

type Plan = z.infer<typeof planSchema>;
type PlanId = z.infer<typeof planIdSchema>;
type CreatePlanRequest = z.input<typeof createPlanRequestSchema>;
type UpdatePlanRequest = z.input<typeof updatePlanRequestSchema>;

export {
  planSchema,
  planIdSchema,
  createPlanRequestSchema,
  updatePlanRequestSchema,
  planResponseSchema,
  deletePlanResponseSchema,
};

export type { Plan, PlanId, CreatePlanRequest, UpdatePlanRequest };
