import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { Briefing, Preview } from './types';

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

  resetMission = () => {
    this.fileName = '';
    this.missionName = '';
    this.author = '';
    this.island = '';
    this.preview = null;
    this.dlcs = [];
    this.briefing = null;
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
        this.island = data.data.island;
        this.preview = data.data.preview;
        this.dlcs = data.data.dlcs;
        this.briefing = data.data.briefing;
      }
    } catch (error) {
      toasterEntity.callToaster({
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
