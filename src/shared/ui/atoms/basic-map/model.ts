import { makeAutoObservable } from 'mobx';

class BasicMap {
  zoomLevel: number = 0;
  /** Arma coordinates (meters) to focus; `nonce` re-triggers the same point. */
  flyCoordinates = {
    x: 0,
    y: 0,
    nonce: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setZoomLevel = (zoomLevel: number) => {
    this.zoomLevel = zoomLevel;
  };

  /** Focus the map on an Arma position (x = east, y = north). */
  flyTo = (x: number, y: number) => {
    this.flyCoordinates = {
      x,
      y,
      nonce: this.flyCoordinates.nonce + 1,
    };
  };
}

const basicMapEntity = new BasicMap();

export { BasicMap, basicMapEntity };
