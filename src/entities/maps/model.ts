import { mapList } from '@/shared/data/map-list';

import { makeAutoObservable, makeObservable } from 'mobx';

class MapsModel {
  selectedMap: (typeof mapList)[0] | null = mapList[0];
  defaultMap = mapList[0];

  constructor() {
    makeAutoObservable(this);
  }

  getMaps = () => {
    return mapList;
  };

  unselectMap = () => {
    this.selectedMap = null;
  };

  selectMap = (map: (typeof mapList)[0]) => {
    this.selectedMap = { ...map };
  };
}

const mapsEntity = new MapsModel();

export { mapsEntity, MapsModel };
