import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';

class Mission {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;

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

      console.log(data.data);
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
