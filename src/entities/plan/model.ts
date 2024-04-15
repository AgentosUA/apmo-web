import { makeAutoObservable } from 'mobx';
import { Mission, missionEntity } from '../mission';

import { apmoApi } from '@/shared/sdk';
import { MarkersModel, markersEntity } from '../markers';

class Plan {
  private mission: Mission;
  private markers: MarkersModel;
  private title = '';

  public savePlan = async () => {
    apmoApi.plan.createPlan({
      title: this.title ?? 'Untitled',
      mission: null,
      planMarkers: JSON.stringify(this.markers.swtMarkers),
    });
  };

  public loadPlan = async (id: string) => {
    try {
      const { data } = await apmoApi.plan.getPlanById({ id });

      missionEntity.fileName = data.title;
    } catch (error) {
      console.log(error);
    }
  };

  constructor(mission: Mission = missionEntity, markers = markersEntity) {
    makeAutoObservable(this);

    this.mission = mission;
    this.markers = markers;
  }
}

const planEntity = new Plan();

export { Plan, planEntity };
