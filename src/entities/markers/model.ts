import { makeAutoObservable } from 'mobx';

class MarkersModel {
  missionsMarkers = [];
  swtMarkers = [];

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

export { markersEntity, MarkersModel };
