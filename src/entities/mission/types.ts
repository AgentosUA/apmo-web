import { callsignsObject } from './data';

type Callsigns = typeof callsignsObject | null;

type Side = 'West' | 'East' | 'Independent' | 'Civilian' | 'Unknown';

type Preview = {
  image?: string;
  text?: string;
};

type MissionMarker = {
  id: number;
  type?: string;
  markerType?: string;
  colorName?: string;
  width: number;
  height: number;
  position: {
    coordinates: {
      x: number;
      y: number;
      z: number;
    };
    angle: number;
  };
};

type Briefing = {
  diary: { id: string; name: string; value: string }[];
  intel: {
    overviewText: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
};

type Position = {
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  angles: [number, number, number];
};

type Unit = {
  id: number;
  side: Side;
  rank: string;
  type: string;
  description: string;
  isPlayable: boolean;
  inventory: null;
  position: Position;
};

type Group = {
  id: number;
  side: Side;
  units: Unit[];
};

type Vehicle = {
  id: number;
  type: 'land' | 'air' | 'crate' | 'static' | 'unknown';
  description: string;
  position: Position;
};

type Mission = {
  fileName: string;
  missionName: string;
  island: string;
  author: string;
  preview: Preview | null;
  briefing: Briefing | null;
  dlcs: string[];
  vehicles: Vehicle[];
  markers: MissionMarker[];
  groups: Group[];
  slots: Callsigns;
};

export type {
  Side,
  Preview,
  Briefing,
  Unit,
  Group,
  Vehicle,
  Mission,
  MissionMarker,
  Callsigns,
};
