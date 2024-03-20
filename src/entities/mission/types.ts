type Side = 'West' | 'East' | 'Resistance' | 'Civilian' | 'Unknown';

type Preview = {
  image?: string;
  text?: string;
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

export type { Side, Preview, Briefing, Unit, Group };
