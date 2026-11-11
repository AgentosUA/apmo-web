import { makeAutoObservable } from 'mobx';

import { api } from '@/shared/sdk';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import type { Mission as MissionFile } from './types';

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
      const data = await api.missions.parse({ file: mission });

      if (data) {
        // Not every mission.sqm has Intel.briefingName (the name may live only in
        // description.ext), so fall back to the file name, e.g. "VTG_Mission_v1.Altis" → "VTG_Mission_v1".
        const fileName = data.fileName || mission.name.replace(/\.pbo$/i, '');
        const missionName =
          data.missionName?.trim() ||
          (data.island ? fileName.replace(new RegExp(`\\.${data.island}$`, 'i'), '') : fileName);

        this.setMission({ ...data, missionName });

        toasterEntity.call({
          title: 'Mission loaded',
          description: missionName,
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
