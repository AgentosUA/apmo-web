import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import { makeAutoObservable } from 'mobx';

import {
  Briefing,
  Group,
  MissionMarker,
  Preview,
  Vehicle,
  Mission as MissionFile,
} from './types';
import { apmoApi } from '@/shared/sdk';

class Mission {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;

  data: MissionFile | null = null;

  slotsType: 'list' | 'grid' = 'list';

  resetMission = () => {
    if (!this.data) return;

    this.data = null;
  };

  setMission = (mission: MissionFile) => {
    this.data = {
      ...mission,
    };
  };

  loadMission = async (mission?: File) => {
    if (!mission) return;

    this.isLoading = true;

    try {
      const { data } = await apmoApi.mission.parse(mission);

      if (data) {
        this.setMission(data);

        toasterEntity.call({
          title: `Mission loaded`,
          description: `${this?.data?.missionName}`,
        });
      }
    } catch (error) {
      toasterEntity.call({
        title: 'Failed to load mission',
        description: 'Check your file and try again',
      });
    } finally {
      this.isLoading = false;
    }
  };
}

const missionEntity = new Mission();

export { Mission, missionEntity };
