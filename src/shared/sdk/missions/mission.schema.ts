import { z } from 'zod';

/* ----------------------------- entities ----------------------------- */

const sideSchema = z.enum(['West', 'East', 'Independent', 'Civilian', 'Unknown']);

const coordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const positionSchema = z.object({
  coordinates: coordinatesSchema,
  angles: z.tuple([z.number(), z.number(), z.number()]),
});

const previewSchema = z.object({
  image: z.string().optional(),
  text: z.string().optional(),
});

const missionMarkerSchema = z.object({
  id: z.number(),
  type: z.string().optional(),
  markerType: z.string().optional(),
  colorName: z.string().optional(),
  /** Arma brush (CfgMarkerBrushes), e.g. "Solid", "Border", "FDiagonal". */
  fillName: z.string().optional(),
  /** Marker text, when provided by the parser. */
  text: z.string().optional(),
  /** Missions parsed before the API filled defaults may lack these (Arma omits 1). */
  width: z.number().default(1),
  height: z.number().default(1),
  position: z.object({
    coordinates: coordinatesSchema,
    angle: z.number(),
  }),
});

const briefingSchema = z.object({
  diary: z.array(z.object({ id: z.string(), name: z.string(), value: z.string() })),
  intel: z.object({
    overviewText: z.string(),
    // Optional: mission.sqm omits default values.
    year: z.number().optional(),
    month: z.number().optional(),
    day: z.number().optional(),
    hour: z.number().default(0),
    minute: z.number().default(0),
  }),
});

const unitSchema = z.object({
  id: z.number(),
  side: sideSchema,
  rank: z.string().default('PRIVATE'),
  type: z.string(),
  description: z.string().default(''),
  isPlayable: z.boolean(),
  inventory: z.unknown(),
  position: positionSchema,
});

const groupSchema = z.object({
  id: z.number(),
  side: sideSchema,
  /**
   * Lobby callsign ("Alpha 1-1"), `@Alpha X-Y` overrides respected. `null` for
   * groups without playable units; missing in plans saved before it was added.
   */
  callsign: z.string().nullish(),
  units: z.array(unitSchema),
});

const vehicleSchema = z.object({
  id: z.number(),
  type: z.enum(['land', 'air', 'crate', 'static', 'unknown']),
  description: z.string(),
  /** Older missions stored only `angle` (yaw) instead of `angles`. */
  position: z
    .object({
      coordinates: coordinatesSchema,
      angles: z.tuple([z.number(), z.number(), z.number()]).optional(),
      angle: z.number().optional(),
    })
    .transform(({ coordinates, angles, angle }) => ({
      coordinates,
      angles: angles ?? ([0, angle ?? 0, 0] as [number, number, number]),
    })),
});

/**
 * Squad name per callsign ("Alpha 1-1" → "Hammer"). `null` when never filled in;
 * missing in a freshly parsed mission (the API fills the callsigns on save).
 */
const slotsSchema = z.record(z.string(), z.string()).nullish();

const missionSchema = z.object({
  fileName: z.string(),
  missionName: z.string(),
  island: z.string(),
  author: z.string(),
  preview: previewSchema.nullable(),
  briefing: briefingSchema.nullable(),
  dlcs: z.array(z.string()),
  vehicles: z.array(vehicleSchema),
  markers: z.array(missionMarkerSchema),
  groups: z.array(groupSchema),
  slots: slotsSchema,
});

/* ----------------------------- requests ----------------------------- */

const fileSchema = z.custom<File>(
  (value) => typeof File !== 'undefined' && value instanceof File,
  'Mission file is required'
);

/** `POST /missions/parse` — multipart upload of `mission.sqm`. */
const parseMissionRequestSchema = z.object({ file: fileSchema });

/* ----------------------------- responses ---------------------------- */

const parseMissionResponseSchema = missionSchema;

/* ------------------------------- types ------------------------------ */

type Side = z.infer<typeof sideSchema>;
type Preview = z.infer<typeof previewSchema>;
type MissionMarker = z.infer<typeof missionMarkerSchema>;
type Briefing = z.infer<typeof briefingSchema>;
type Unit = z.infer<typeof unitSchema>;
type Group = z.infer<typeof groupSchema>;
type Vehicle = z.infer<typeof vehicleSchema>;
type Mission = z.infer<typeof missionSchema>;
type ParseMissionRequest = z.input<typeof parseMissionRequestSchema>;

export {
  sideSchema,
  previewSchema,
  missionMarkerSchema,
  briefingSchema,
  unitSchema,
  groupSchema,
  vehicleSchema,
  slotsSchema,
  missionSchema,
  parseMissionRequestSchema,
  parseMissionResponseSchema,
};

export type {
  Side,
  Preview,
  MissionMarker,
  Briefing,
  Unit,
  Group,
  Vehicle,
  Mission,
  ParseMissionRequest,
};
