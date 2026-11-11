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
  width: z.number(),
  height: z.number(),
  position: z.object({
    coordinates: coordinatesSchema,
    angle: z.number(),
  }),
});

const briefingSchema = z.object({
  diary: z.array(z.object({ id: z.string(), name: z.string(), value: z.string() })),
  intel: z.object({
    overviewText: z.string(),
    year: z.number(),
    month: z.number(),
    day: z.number(),
    hour: z.number(),
    minute: z.number(),
  }),
});

const unitSchema = z.object({
  id: z.number(),
  side: sideSchema,
  rank: z.string(),
  type: z.string(),
  description: z.string(),
  isPlayable: z.boolean(),
  inventory: z.unknown(),
  position: positionSchema,
});

const groupSchema = z.object({
  id: z.number(),
  side: sideSchema,
  units: z.array(unitSchema),
});

const vehicleSchema = z.object({
  id: z.number(),
  type: z.enum(['land', 'air', 'crate', 'static', 'unknown']),
  description: z.string(),
  position: positionSchema,
});

/** Squad name per callsign ("Alpha 1-1" → "Hammer"). `null` when never filled in. */
const slotsSchema = z.record(z.string(), z.string()).nullable();

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
