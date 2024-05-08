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

  setMission = (mission: MissionFile) => {
    this.fileName = mission.fileName;
    this.missionName = mission.missionName;
    this.author = mission.author;
    this.island = mission.island;
    this.preview = mission.preview;
    this.dlcs = mission.dlcs;
    this.briefing = mission.briefing;
    this.groups = mission.groups;
    this.markers = mission.markers;
    this.vehicles = mission.vehicles;
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
