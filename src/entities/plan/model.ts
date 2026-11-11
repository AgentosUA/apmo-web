import { makeAutoObservable } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { getWorldDisplayName } from '@/shared/lib/ocap/worlds';
import {
  api,
  getApiErrorMessage,
  isApiError,
  type PlanAccess,
  type PlanDetails,
  type PlanPermissions,
  type PublicUser,
  type UpdatePlanAccessRequest,
} from '@/shared/sdk';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import { mapsEntity } from '../maps';
import { MarkersModel, markersEntity } from '../markers';
import { Mission, missionEntity } from '../mission';

type PlanLoadError = 'not_found' | 'forbidden';

class Plan {
  private markers: MarkersModel;
  private mission: Mission;

  id = '';
  title = '';
  world: string | null = null;
  owner: PublicUser | null = null;
  /** `null` until a saved plan is loaded. */
  permissions: PlanPermissions | null = null;
  /** Only known to the owner. */
  access: PlanAccess | null = null;
  loadError: PlanLoadError | null = null;
  isSaving = false;

  constructor(mission: Mission = missionEntity, markers = markersEntity) {
    makeAutoObservable<Plan, 'markers' | 'mission'>(this, { markers: false, mission: false });

    this.mission = mission;
    this.markers = markers;
  }

  /** A plan that exists on the server (changes are synced in real time). */
  get isSaved() {
    return Boolean(this.id);
  }

  /** An unsaved plan is always editable locally. */
  get canEdit() {
    return !this.id || Boolean(this.permissions?.canEdit);
  }

  get isOwner() {
    return Boolean(this.permissions?.isOwner);
  }

  /** Suggested name in the save dialog. */
  get defaultTitle() {
    return (
      this.title || this.mission.data?.missionName || mapsEntity.selectedMap?.name || 'Untitled'
    );
  }

  setTitle = (title: string) => {
    this.title = title;
  };

  setPermissions = (permissions: PlanPermissions) => {
    this.permissions = permissions;
    this.markers.setReadOnly(!permissions.canEdit);
  };

  setLoadError = (error: PlanLoadError | null) => {
    this.loadError = error;
  };

  /**
   * Creates the plan from what is on the map. Returns the new id or `null`.
   * Later changes are saved automatically (see `planSession`).
   */
  createPlan = async (title: string): Promise<string | null> => {
    const mission = this.mission.data;

    try {
      this.isSaving = true;

      const data = await api.plans.create({
        title: title.trim() || this.defaultTitle,
        world: mission?.island || mapsEntity.selectedMap?.id || null,
        mission: this.missionPayload(),
        planMarkers: JSON.stringify(this.markers.swtMarkers),
      });

      this.apply(data);

      return data.id;
    } catch (error) {
      toasterEntity.call({
        title: 'widgets:planToolbar:saveFailed',
        description: getApiErrorMessage(error),
      });

      return null;
    } finally {
      this.isSaving = false;
    }
  };

  loadPlan = async (id: string) => {
    this.loadError = null;

    try {
      const data = await api.plans.getById({ id });

      this.apply(data);

      if (data.mission) {
        this.mission.setMission(data.mission);
      }

      const world = data.mission?.island || data.world;

      if (world) {
        const isMapAvailable = await mapsEntity.selectMap(world);

        if (!isMapAvailable) {
          toasterEntity.call({
            title: i18n.t('toasters:mapNotAvailable'),
            description: i18n.t('toasters:mapNotInOcapDatabase', {
              map: getWorldDisplayName(world),
            }),
          });
        }
      }

      try {
        this.markers.setSWTMarkers(JSON.parse(data.planMarkers || '[]'));
      } catch {
        this.markers.setSWTMarkers([]);
      }
    } catch (error) {
      this.loadError = isApiError(error, 403) ? 'forbidden' : 'not_found';
    }
  };

  /** Owner only. */
  updateAccess = async (value: UpdatePlanAccessRequest) => {
    const data = await api.plans.updateAccess({ id: this.id, ...value });

    this.apply(data);
  };

  reset = () => {
    this.id = '';
    this.title = '';
    this.world = null;
    this.owner = null;
    this.permissions = null;
    this.access = null;
    this.loadError = null;
    this.markers.setReadOnly(false);
  };

  /** A mission uploaded into a saved plan (that had none). */
  saveMission = async () => {
    if (!this.id || !this.canEdit) return;

    try {
      const data = await api.plans.update({
        id: this.id,
        mission: this.missionPayload(),
        world: this.mission.data?.island || this.world,
      });

      this.apply(data);
    } catch (error) {
      toasterEntity.call({
        title: 'widgets:planToolbar:saveFailed',
        description: getApiErrorMessage(error),
      });
    }
  };

  private missionPayload() {
    const mission = this.mission.data;

    if (!mission?.fileName) return null;

    return {
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
    };
  }

  private apply(data: PlanDetails) {
    this.id = data.id;
    this.title = data.title;
    this.world = data.world ?? null;
    this.owner = data.owner;
    this.access = data.access ?? null;
    this.setPermissions(data.permissions);
  }
}

const planEntity = new Plan(missionEntity, markersEntity);

export { Plan, planEntity };

export type { PlanLoadError };
