import { makeAutoObservable } from 'mobx';
import { Mission, missionEntity } from '../mission';

import { apmoApi } from '@/shared/sdk';
import { MarkersModel, markersEntity } from '../markers';

import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { mapsEntity } from '../maps';

class Plan {
  private markers: MarkersModel;
  private mission: Mission;
  title = '';

  constructor(mission: Mission = missionEntity, markers = markersEntity) {
    makeAutoObservable(this);

    this.mission = mission;
    this.markers = markers;
  }

  public savePlan = async (isRedirect = true) => {
    const { data } = await apmoApi.plan.createPlan({
      title: this.title ?? 'Untitled',
      mission: missionEntity.data?.fileName
        ? {
            author: missionEntity.data?.author,
            fileName: missionEntity.data?.fileName,
            dlcs: missionEntity.data?.dlcs,
            briefing: missionEntity.data?.briefing,
            groups: missionEntity.data?.groups,
            island: missionEntity.data?.island,
            markers: missionEntity.data?.markers,
            preview: missionEntity.data?.preview,
            missionName: missionEntity.data?.missionName,
            vehicles: missionEntity.data?.vehicles,
            slots: missionEntity.data?.slots,
          }
        : null,
      planMarkers: JSON.stringify(this.markers.swtMarkers),
    });

    if (isRedirect && data.id) {
      // redirect(`/plans/${data.id}`);
      window.location.href = `/plans/${data.id}`;
    } else {
      toasterEntity.call({
        title: 'Failed to save plan',
        description: 'Report this problem',
      });
    }
  };

  public loadPlan = async (id: string) => {
    try {
      const { data, status } = await apmoApi.plan.getPlanById({ id });

      if (status === 404) return;

      planEntity.title = data.title;
      missionEntity.setMission(data.mission);
      mapsEntity.selectMap(data.mission.island);
      markersEntity.setSWTMarkers(JSON.parse(data.planMarkers));
    } catch (error) {}
  };
}

const planEntity = new Plan(missionEntity, markersEntity);

export { Plan, planEntity };
