import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import axios from 'axios';

import { makeAutoObservable } from 'mobx';

import { Briefing, Group, Preview } from './types';

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

  resetMission = () => {
    this.fileName = '';
    this.missionName = '';
    this.author = '';
    this.island = '';
    this.preview = null;
    this.dlcs = [];
    this.briefing = null;
    this.groups = [];
  };

  loadMission = async (mission?: File) => {
    if (!mission) return;

    this.isLoading = true;

    try {
      const data = await axios(
        `${process.env.NEXT_PUBLIC_API_URL}/missions/parse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data: {
            file: mission,
          },
        }
      );

      if (data.data) {
        this.fileName = mission.name;
        this.missionName = data.data.missionName;
        this.author = data.data.author;
        this.island = data.data.island?.toLowerCase();
        this.preview = data.data.preview;
        this.dlcs = data.data.dlcs;
        this.briefing = data.data.briefing;
        this.groups = data.data.groups;

        toasterEntity.call({
          title: `Mission ${this.missionName} loaded`,
          description: 'Time for some planning!',
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
