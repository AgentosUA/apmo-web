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
    ['blue', [3070.07, 5372.62], 15, 9, 0, 1, '', []],
    // ['red', [3061.42, 5199.73], 15, 3, 0, 1, '', []],
    // ['green', [3070.07, 5035.48], 15, 8, 0, 1, '', []],
    // ['black', [3057.1, 4875.56], 15, 1, 0, 1, '', []],
    // ['white', [3048.46, 4711.31], 15, 11, 0, 1, '', []],
    // ['yelloow', [3044.14, 4577.33], 15, 6, 0, 1, '', []],
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
