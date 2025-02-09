import { mapList } from '@/shared/data/map-list';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { Location } from '@/shared/ui/atoms/marker';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import axios from 'axios';

import { makeAutoObservable } from 'mobx';

class MapsModel {
  selectedMap: (typeof mapList)[0] | null = null;
  defaultMap = mapList[8];
  locations: Location[] = [];

  isLocationsLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  getMaps = () => {
    return mapList;
  };

  unselectMap = () => {
    this.selectedMap = null;
    this.locations = [];
  };

  selectMap = (map: (typeof mapList)[0] | string) => {
    if (typeof map === 'string') {
      if (this.selectedMap?.id === map) return;

      const newMap = mapList.find((m) => m.id === map?.toLowerCase());

      if (!newMap) return;

      this.selectedMap = { ...newMap };

      return;
    }

    this.selectedMap = { ...map };
    this.defaultMap = { ...map };

    basicMapEntity.flyTo(0, 0);
  };

  getLocations = async (map?: string) => {
    if (!this.selectedMap || !map) return;

    try {
      if (!map) return;

      const response = await axios.get(`/locations/${map}.json`);

      this.locations = [...(response.data as Location[])];
    } catch (error) {
      // toasterEntity.call({
      //   title: 'Failed to load locations',
      //   description: 'Report to devs',
      // });
    } finally {
      this.isLocationsLoading = false;
    }
  };
}

const mapsEntity = new MapsModel();

export { mapsEntity, MapsModel };
