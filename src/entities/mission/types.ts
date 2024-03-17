type Preview = {
  image?: string;
  text?: string;
};

type Briefing = {
  diary: { name: string; value: string }[];
  intel: {
    overviewText: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
};

export type { Preview, Briefing };
