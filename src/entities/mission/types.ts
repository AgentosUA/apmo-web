import type {
  Briefing,
  Group,
  Mission,
  MissionMarker,
  Preview,
  Side,
  Unit,
  Vehicle,
} from '@/shared/sdk';

import { callsignsObject } from './data';

/** Mission data types are inferred from the SDK zod schemas (`shared/sdk/missions/mission.schema.ts`). */
type Callsigns = typeof callsignsObject | null;

export type { Side, Preview, Briefing, Unit, Group, Vehicle, Mission, MissionMarker, Callsigns };
