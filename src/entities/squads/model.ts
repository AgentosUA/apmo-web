import { makeAutoObservable, runInAction } from 'mobx';

import { api, type Squad, type SquadForm } from '@/shared/sdk';

/** Squads of the current user (profile → "Squads" tab). Mutations throw API errors. */
class SquadsModel {
  items: Squad[] = [];
  isLoading = false;
  isLoaded = false;
  error = false;

  constructor() {
    makeAutoObservable(this);
  }

  load = async () => {
    try {
      this.isLoading = true;
      this.error = false;

      const items = await api.squads.my();

      runInAction(() => {
        this.items = items;
        this.isLoaded = true;
      });
    } catch {
      runInAction(() => {
        this.error = true;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  create = async (form: SquadForm) => {
    const squad = await api.squads.create(form);

    this.upsert(squad);

    return squad;
  };

  update = async (id: string, form: SquadForm) => {
    this.upsert(await api.squads.update(id, form));
  };

  remove = async (id: string) => {
    await api.squads.remove(id);

    runInAction(() => {
      this.items = this.items.filter((squad) => squad.id !== id);
    });
  };

  addMember = async (id: string, userId: string) => {
    this.upsert(await api.squads.addMember(id, userId));
  };

  removeMember = async (id: string, userId: string) => {
    this.upsert(await api.squads.removeMember(id, userId));
  };

  /** A member leaves: the squad disappears from the list. */
  leave = async (id: string, userId: string) => {
    await api.squads.removeMember(id, userId);

    runInAction(() => {
      this.items = this.items.filter((squad) => squad.id !== id);
    });
  };

  uploadLogo = async (id: string, file: File) => {
    this.upsert(await api.squads.uploadLogo(id, file));
  };

  removeLogo = async (id: string) => {
    this.upsert(await api.squads.removeLogo(id));
  };

  reset = () => {
    this.items = [];
    this.isLoaded = false;
    this.error = false;
  };

  private upsert(squad: Squad) {
    const index = this.items.findIndex((item) => item.id === squad.id);

    if (index === -1) {
      this.items = [...this.items, squad].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.items[index] = squad;
    }
  }
}

const squadsEntity = new SquadsModel();

export { SquadsModel, squadsEntity };
