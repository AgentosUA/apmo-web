import { makeAutoObservable } from 'mobx';

import { api, getApiErrorMessage, isApiError } from '@/shared/sdk';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import type { Mission as MissionFile } from './types';

class Mission {
  constructor() {
    makeAutoObservable(this);
  }

  isLoading = false;

  data: MissionFile | null = null;

  slotsType: 'list' | 'grid' = 'list';

  resetMission = () => {
    if (!this.data) return;

    this.data = null;
  };

  setMission = (mission: MissionFile) => {
    this.data = {
      ...mission,
    };
  };

  private applyParsedMission = (data: MissionFile | null | undefined, sourceName: string) => {
    if (!data) return;

    // Not every mission.sqm has Intel.briefingName (the name may live only in
    // description.ext), so fall back to the file name, e.g. "VTG_Mission_v1.Altis" → "VTG_Mission_v1".
    const fileName = data.fileName || sourceName.replace(/\.pbo$/i, '');
    const missionName =
      data.missionName?.trim() ||
      (data.island ? fileName.replace(new RegExp(`\\.${data.island}$`, 'i'), '') : fileName);

    this.setMission({ ...data, missionName });

    toasterEntity.call({
      title: 'toasters:missionLoadedTitle',
      description: missionName,
    });
  };

  loadMission = async (mission?: File) => {
    if (!mission) return;

    this.isLoading = true;

    try {
      const data = await api.missions.parse({ file: mission });

      this.applyParsedMission(data, mission.name);
    } catch (error) {
      toasterEntity.call({
        title: 'toasters:missionLoadFailedTitle',
        description: 'toasters:missionLoadFailedDescription',
      });
    } finally {
      this.isLoading = false;
    }
  };

  /** Shortcut for `?file=<url>`: same flow as an upload, the API downloads the .pbo. */
  loadMissionFromUrl = async (url?: string | null) => {
    if (!url || this.isLoading) return;

    this.isLoading = true;

    try {
      const data = await api.missions.parseUrl({ url });

      let sourceName = '';
      try {
        sourceName = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
      } catch {
        // The API has validated the link; the name is only a fallback.
      }

      this.applyParsedMission(data, sourceName);
    } catch (error) {
      toasterEntity.call({
        title: 'toasters:missionLoadFailedTitle',
        description: isApiError(error, 403)
          ? 'toasters:missionUrlNotAllowed'
          : isApiError(error, 500)
            ? 'toasters:missionLoadFailedDescription'
            : getApiErrorMessage(error, 'toasters:missionLoadFailedDescription'),
      });
    } finally {
      this.isLoading = false;
    }
  };
}

const missionEntity = new Mission();

export { Mission, missionEntity };
