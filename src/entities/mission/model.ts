import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import { makeAutoObservable } from 'mobx';

import { Briefing, Group, MissionMarker, Preview, Vehicle } from './types';
import { apmoApi } from '@/shared/sdk';

class Mission {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;

  fileName = '';
  missionName = '';
  author = '';
  island = '';
  preview: Preview | null = null;
  dlcs: string[] = [];
  briefing: Briefing | null = null;
  groups: Group[] = [];
  markers: MissionMarker[] = [];
  vehicles: Vehicle[] = [];

  resetMission = () => {
    this.fileName = '';
    this.missionName = '';
    this.author = '';
    this.island = '';
    this.preview = null;
    this.dlcs = [];
    this.briefing = null;
    this.groups = [];
    this.markers = [];
    this.vehicles = [];
  };

  loadMission = async (mission?: File) => {
    if (!mission) return;

    this.isLoading = true;

    try {
      const { data } = await apmoApi.mission.parse(mission);

      if (data) {
        this.fileName = mission.name;
        this.missionName = data.missionName;
        this.author = data.author;
        this.island = data.island?.toLowerCase();
        this.preview = data.preview;
        this.dlcs = data.dlcs;
        this.briefing = data.briefing;
        this.groups = data.groups;
        this.markers = data.markers;
        this.vehicles = data.vehicles;

        toasterEntity.call({
          title: `Mission loaded`,
          description: `${this.missionName}`,
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
