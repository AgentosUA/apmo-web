import { makeAutoObservable } from 'mobx';
import { Mission, missionEntity } from '../mission';

import { apmoApi } from '@/shared/sdk';
import { MarkersModel, markersEntity } from '../markers';

import { redirect } from 'next/navigation';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

class Plan {
  private mission: Mission;
  private markers: MarkersModel;
  private title = '';

  public savePlan = async () => {
    try {
      const { data } = await apmoApi.plan.createPlan({
        title: this.title ?? 'Untitled',
        mission: {
          author: missionEntity.author,
          fileName: missionEntity.fileName,
          dlcs: missionEntity.dlcs,
          briefing: missionEntity.briefing,
          groups: missionEntity.groups,
          island: missionEntity.island,
          markers: missionEntity.markers,
          preview: missionEntity.preview,
          missionName: missionEntity.missionName,
          vehicles: missionEntity.vehicles,
        },
        planMarkers: JSON.stringify(this.markers.swtMarkers),
      });

      redirect(`/plans/${data.id}`);
    } catch (error) {
      toasterEntity.call({
        title: 'Failed to save plan',
        description: 'Report this problem',
      });
    }
  };

  public loadPlan = async (id: string) => {
    try {
      const { data } = await apmoApi.plan.getPlanById({ id });

      planEntity.title = data.title;
      missionEntity.setMission(data.mission);

      // redirect(`/plans/${data.id}`);
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

const planEntity = new Plan(missionEntity, markersEntity);

export { Plan, planEntity };
