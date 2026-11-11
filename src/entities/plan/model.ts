import { makeAutoObservable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { getWorldDisplayName } from '@/shared/lib/ocap/worlds';
import { api, getApiErrorMessage } from '@/shared/sdk';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import { mapsEntity } from '../maps';
import { MarkersModel, markersEntity } from '../markers';
import { Mission, missionEntity } from '../mission';

class Plan {
  private markers: MarkersModel;
  private mission: Mission;
  id = '';
  title = '';

  constructor(mission: Mission = missionEntity, markers = markersEntity) {
    makeAutoObservable(this);

    this.mission = mission;
    this.markers = markers;
  }

  public savePlan = async (isRedirect = true) => {
    const mission = missionEntity.data;

    const payload = {
      title: this.title ?? 'Untitled',
      mission: mission?.fileName
        ? {
            author: mission.author,
            fileName: mission.fileName,
            dlcs: mission.dlcs,
            briefing: mission.briefing,
            groups: mission.groups,
            island: mission.island,
            markers: mission.markers,
            preview: mission.preview,
            missionName: mission.missionName,
            vehicles: mission.vehicles,
            slots: mission.slots,
          }
        : null,
      planMarkers: JSON.stringify(this.markers.swtMarkers),
    };

    if (planEntity.id && missionEntity.data?.missionName) {
      try {
        await api.plans.update({
          id: planEntity.id,
          ...payload,
        });

        toasterEntity.call({
          title: 'Plan saved',
          description: 'Your plan has been saved',
        });
      } catch (error) {
        toasterEntity.call({
          title: 'Failed to save plan',
          description: getApiErrorMessage(error),
        });
      }

      return;
    }

    let data;

    try {
      data = await api.plans.create(payload);
    } catch (error) {
      toasterEntity.call({
        title: 'Failed to save plan',
        description: getApiErrorMessage(error),
      });

      return;
    }

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
      const data = await api.plans.getById({ id });

      planEntity.title = data.title;
      planEntity.id = data.id;

      if (data.mission) {
        missionEntity.setMission(data.mission);
        const isMapAvailable = await mapsEntity.selectMap(data.mission.island);

        if (!isMapAvailable) {
          toasterEntity.call({
            title: i18n.t('toasters:mapNotAvailable'),
            description: i18n.t('toasters:mapNotInOcapDatabase', {
              map: getWorldDisplayName(data.mission.island),
            }),
          });
        }
      }

      markersEntity.setSWTMarkers(JSON.parse(data.planMarkers));
    } catch (error) {}
  };
}

const planEntity = new Plan(missionEntity, markersEntity);

export { Plan, planEntity };
