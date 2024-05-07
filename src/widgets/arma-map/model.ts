import { makeAutoObservable } from 'mobx';

class ArmaMap {
  zoomLevel: number = 2;
  flyCoordinates = {
    x: 0,
    y: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setZoomLevel = (zoomLevel: number) => {
    this.zoomLevel = zoomLevel;
  };

  flyTo = (lat: number, lng: number) => {
    this.flyCoordinates = {
      x: lat,
      y: lng,
    };
  };
}

const armaMapEntity = new ArmaMap();

export { ArmaMap, armaMapEntity };
