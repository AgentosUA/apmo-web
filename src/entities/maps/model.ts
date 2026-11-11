import axios from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';

import {
  getWorldConfig,
  getWorldDisplayName,
  getWorldLocationsFile,
  getWorlds,
  normalizeWorldName,
  WorldConfig,
  WorldInfo,
} from '@/shared/lib/ocap/worlds';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { Location } from '@/shared/ui/atoms/marker';

type SelectedMap = {
  /** Arma worldName, lower-case (also the OCAP map id). */
  id: string;
  name: string;
  /** OCAP map.json; null while loading. */
  config: WorldConfig | null;
};

class MapsModel {
  worlds: WorldInfo[] = [];
  selectedMap: SelectedMap | null = null;
  /** Last world chosen in the selector. */
  defaultMap = 'altis';
  locations: Location[] = [];

  isWorldsLoading = false;
  isMapLoading = false;
  isLocationsLoading = false;
  /** worldName that could not be found in the OCAP map database. */
  unavailableMap: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadWorlds = async () => {
    if (this.worlds.length) return this.worlds;
    this.isWorldsLoading = true;
    try {
      const worlds = await getWorlds();
      runInAction(() => {
        this.worlds = worlds;
      });
      return worlds;
    } finally {
      runInAction(() => {
        this.isWorldsLoading = false;
      });
    }
  };

  getMaps = () => this.worlds;

  unselectMap = () => {
    this.selectedMap = null;
    this.locations = [];
  };

  /**
   * Select a world by Arma worldName and load its OCAP map configuration.
   * Resolves to `false` when the world is not in the OCAP map database.
   */
  selectMap = async (worldName: string): Promise<boolean> => {
    const id = normalizeWorldName(worldName);
    if (!id) return false;
    if (this.selectedMap?.id === id && this.selectedMap.config) return true;

    this.isMapLoading = true;
    this.unavailableMap = null;

    try {
      const config = await getWorldConfig(id);

      if (!config) {
        runInAction(() => {
          this.unavailableMap = id;
        });
        return false;
      }

      runInAction(() => {
        this.selectedMap = {
          id,
          name: config.displayName || getWorldDisplayName(id),
          config,
        };
        this.defaultMap = id;
        this.locations = [];
      });

      basicMapEntity.flyTo(0, 0);
      void this.getLocations();

      return true;
    } finally {
      runInAction(() => {
        this.isMapLoading = false;
      });
    }
  };

  /** Legacy location labels (only used for raster maps; vector styles have their own). */
  getLocations = async () => {
    const map = this.selectedMap;
    if (!map || map.config?.maplibre) return;

    const file = getWorldLocationsFile(map.id);
    if (!file) return;

    this.isLocationsLoading = true;
    try {
      const response = await axios.get(`/locations/${file}.json`, { baseURL: '' });
      runInAction(() => {
        if (this.selectedMap?.id === map.id) this.locations = [...(response.data as Location[])];
      });
    } catch {
      runInAction(() => {
        this.locations = [];
      });
    } finally {
      runInAction(() => {
        this.isLocationsLoading = false;
      });
    }
  };
}

const mapsEntity = new MapsModel();

export { mapsEntity, MapsModel };
export type { SelectedMap };
