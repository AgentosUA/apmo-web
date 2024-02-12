import { makeAutoObservable, observable } from 'mobx';

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
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;
  missionsMarkers: SWTMarkerType[] = [];
  swtMarkers: SWTMarkerType[] = [
    // ['test', [160, 4864], 33, 9, 0, 1, '', []],
    ['zero', [0, 0], 33, 9, 0, 1, '', []],
  ];

  setSWTMarkers = (markers: []) => {
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
    this.isLoading = true;
    const text = await navigator.clipboard.readText();

    this.setSWTMarkers(JSON.parse(text));
    this.isLoading = false;
  };

  SWTMarkerToClipboard = () => {
    const text = JSON.stringify(this.swtMarkers);
    navigator.clipboard.writeText(text);
  };

  updateMarker = (id: number, x: number, y: number) => {
    this.swtMarkers[id][SWTMarkerTypeID.coordinates] = [x, y];
  };

  clearMarkers = () => {
    this.clearMissionMarkers();
    this.clearSWTMarkers();
  };
}

const markersEntity = new MarkersModel();

export { MarkersModel, SWTMarkerTypeID, markersEntity };
