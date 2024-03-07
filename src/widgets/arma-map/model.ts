import { makeAutoObservable } from 'mobx';

class ArmaMap {
  constructor() {
    makeAutoObservable(this);
  }

  zoomLevel: number = 2;

  setZoomLevel = (zoomLevel: number) => {
    this.zoomLevel = zoomLevel;
  };
}

const armaMapEntity = new ArmaMap();

export { ArmaMap, armaMapEntity };
