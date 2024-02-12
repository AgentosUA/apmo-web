import { makeAutoObservable } from 'mobx';

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

class MarkersModel {
  missionsMarkers: SWTMarkerType[] = [];
  swtMarkers: SWTMarkerType[] = [
    ['[WFA]Agentos ', [5338.1, 8603.2], 15, 9, 0, 1, '', []],
    ['EPIC', [3847.55, 8867.41], 33, 8, 0, 1, '', []],
    ['Chiki-airport', [4580.42, 10226.6], 33, 8, 0, 1, '', []],
  ];

  constructor() {
    makeAutoObservable(this);
  }

  setSWTMarkers = (markers: []) => {
    this.swtMarkers = markers;
  };

  clearSWTMarkers = () => {
    this.swtMarkers = [];
  };

  setMissionMarkers = (markers: []) => {
    this.missionsMarkers = markers;
  };

  clearMarkers = () => {
    this.clearMarkers();
    this.clearSWTMarkers();
  };
}

const markersEntity = new MarkersModel();

export { MarkersModel, SWTMarkerTypeID, markersEntity };
