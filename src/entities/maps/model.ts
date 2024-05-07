import { mapList } from '@/shared/data/map-list';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { Location } from '@/shared/ui/atoms/marker';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import axios from 'axios';

import { makeAutoObservable } from 'mobx';

class MapsModel {
  selectedMap: (typeof mapList)[0] | null = null;
  defaultMap = mapList[0];
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
      this.selectedMap = { ...mapList.find((m) => m.dir === map)! };
      this.getLocations(map);

      return;
    }

    this.selectedMap = { ...map };
    this.getLocations(map.dir);
    basicMapEntity.flyTo(0, 0);
  };

  getLocations = async (map?: string) => {
    if (!this.selectedMap || !map) return;

    try {
      if (!map) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STATIC_URL}/locations/${map}.json`
      );

      this.locations = [...(response.data as Location[])];
    } catch (error) {
      toasterEntity.call({
        title: 'Failed to load locations',
        description: 'Report to devs',
      });
    } finally {
      this.isLocationsLoading = false;
    }
  };
}

const mapsEntity = new MapsModel();

export { mapsEntity, MapsModel };
