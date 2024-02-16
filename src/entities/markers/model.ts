import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable, observable } from 'mobx';
import { getValidSWTMarkers } from './lib';

enum SWTMarkerTypeID {
  text,
  coordinates,
  type,
  color,
}

type SWTMarkerType = [
  string,
  [number, number],
  number,
  number,
  number,
  number,
  '',
  []
];

type MarkerType = {
  id: string | number;
  data: SWTMarkerType;
};

class MarkersModel {
  constructor() {
    makeAutoObservable(this);
  }

  isMissionLoading = false;
  isSWTLoading = false;
  missionsMarkers: SWTMarkerType[] = [];
  swtMarkers: MarkerType[] = [
    {
      id: generateRandomId(),
      data: ['blue', [3070.07, 5372.62], 67, 9, 0, 1, '', []],
    },
    {
      id: generateRandomId(),
      data: ['red', [3061.42, 5199.73], 15, 3, 0, 1, '', []],
    },
    {
      id: generateRandomId(),
      data: ['green', [3070.07, 5035.48], 15, 8, 0, 1, '', []],
    },
    {
      id: generateRandomId(),
      data: ['black', [3057.1, 4875.56], 15, 1, 0, 1, '', []],
    },
    {
      id: generateRandomId(),
      data: ['white', [3048.46, 4711.31], 15, 11, 0, 1, '', []],
    },
    {
      id: generateRandomId(),
      data: ['yellow', [3044.14, 4577.33], 15, 6, 0, 1, '', []],
    },
  ];

  setSWTMarkers = (markers: MarkerType[]) => {
    this.swtMarkers = markers;
  };

  clearMissionMarkers = () => {
    this.swtMarkers = [];
  };

  clearSWTMarkers = () => {
    this.swtMarkers = [];
  };

  setMissionMarkers = (markers: []) => {
    this.missionsMarkers = markers;
  };

  SWTMarkerFromClipboard = async () => {
    try {
      this.isSWTLoading = true;

      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text) as unknown;

      const swtMarkers = getValidSWTMarkers(data);

      const parsedMarkers = swtMarkers.map((item) => ({
        id: generateRandomId(),
        data: item,
      }));

      this.setSWTMarkers(parsedMarkers as MarkerType[]);
    } catch (error) {
      console.log(error);
    } finally {
      this.isSWTLoading = false;
    }
  };

  SWTMarkerToClipboard = () => {
    const text = JSON.stringify(this.swtMarkers.map((marker) => marker.data));
    navigator.clipboard.writeText(text);
  };

  updateMarker = (id: number, x: number, y: number) => {
    const index = this.swtMarkers.findIndex((marker) => marker.id === id);

    if (index === -1) return;

    this.swtMarkers[index].data[SWTMarkerTypeID.coordinates] = [x, y];
  };

  clearMarkers = () => {
    this.clearMissionMarkers();
    this.clearSWTMarkers();
  };
}

const markersEntity = new MarkersModel();

export { MarkersModel, SWTMarkerTypeID, markersEntity };

export type { MarkerType, SWTMarkerType };
