type Side = 'West' | 'East' | 'Resistance' | 'Civilian' | 'Unknown';

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

type Unit = {
  id: number;
  side: Side;
  rank: string;
  type: string;
  description: string;
  isPlayable: boolean;
  inventory: null;
  position: {
    coordinates: {
      x: number;
      y: number;
      z: number;
    };
    angles: [number, number, number];
  };
};

type Group = {
  id: number;
  side: Side;
  units: Unit[];
};

type Mission = {
  fileName: string;
  missionName: string;
  island: string;
  author: string;
  preview: Preview | null;
  briefing: Briefing | null;
  dlcs: string[];
  vehicles: any[];
  markers: MissionMarker[];
  groups: Group[];
};

export type { Side, Preview, Briefing, Unit, Group, Mission, MissionMarker };
