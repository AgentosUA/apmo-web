import { makeAutoObservable, runInAction } from 'mobx';

import { getWorldDisplayName } from '@/shared/lib/ocap/worlds';
import {
  api,
  getApiErrorMessage,
  type ProfilePlan,
  type ProfilePlanSort,
  type ProfilePlansResponse,
  type SortOrder,
} from '@/shared/sdk';

type ProfilePlansFilters = {
  search: string;
  /** World class name, '' — all worlds. */
  world: string;
  sort: ProfilePlanSort;
  order: SortOrder;
};

const DEFAULT_FILTERS: ProfilePlansFilters = {
  search: '',
  world: '',
  sort: 'createdAt',
  order: 'desc',
};

/** Default direction when the sort field changes: newest first for dates, A→Z for names. */
const DEFAULT_ORDER: Record<ProfilePlanSort, SortOrder> = {
  createdAt: 'desc',
  updatedAt: 'desc',
  missionName: 'asc',
  world: 'asc',
};

const SEARCH_DEBOUNCE_MS = 300;

const compareText = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });

/**
 * Plans on the profile page: filters by mission name / world and sorting.
 * Filtering and sorting happen on the API; sorting by world is refined here
 * by the display name the user actually sees ("Malden 2035", not "Malden").
 */
class ProfilePlans {
  filters: ProfilePlansFilters = { ...DEFAULT_FILTERS };

  items: ProfilePlan[] = [];

  worlds: ProfilePlansResponse['worlds'] = [];

  total = 0;

  totalAll = 0;

  isLoading = false;

  /** `true` after the first successful load. */
  isLoaded = false;

  error: string | null = null;

  private abortController: AbortController | null = null;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable<this, 'abortController' | 'searchTimer'>(this, {
      abortController: false,
      searchTimer: false,
    });
  }

  get hasActiveFilters() {
    return Boolean(this.filters.search.trim() || this.filters.world);
  }

  /** Worlds for the selector, sorted by display name. */
  get worldOptions() {
    return this.worlds
      .map(({ name, count }) => ({ value: name, label: getWorldDisplayName(name), count }))
      .sort((a, b) => compareText(a.label, b.label));
  }

  get sortedItems() {
    if (this.filters.sort !== 'world') return this.items;

    const direction = this.filters.order === 'asc' ? 1 : -1;

    return [...this.items].sort(
      (a, b) =>
        direction *
        compareText(
          getWorldDisplayName(a.mission?.island ?? ''),
          getWorldDisplayName(b.mission?.island ?? '')
        )
    );
  }

  load = async () => {
    this.clearSearchTimer();
    this.abortController?.abort();

    const controller = new AbortController();
    this.abortController = controller;

    this.isLoading = true;
    this.error = null;

    try {
      const response = await api.profile.plans(this.filters, controller.signal);

      runInAction(() => {
        this.items = response.items;
        this.worlds = response.worlds;
        this.total = response.total;
        this.totalAll = response.totalAll;
        this.isLoaded = true;
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      runInAction(() => {
        this.error = getApiErrorMessage(error);
      });
    } finally {
      if (this.abortController === controller) {
        runInAction(() => {
          this.isLoading = false;
          this.abortController = null;
        });
      }
    }
  };

  setSearch = (search: string) => {
    this.filters.search = search;

    this.clearSearchTimer();
    this.searchTimer = setTimeout(this.load, SEARCH_DEBOUNCE_MS);
  };

  setWorld = (world: string) => {
    this.filters.world = world;
    this.load();
  };

  setSort = (sort: ProfilePlanSort) => {
    if (sort === this.filters.sort) return;

    this.filters.sort = sort;
    this.filters.order = DEFAULT_ORDER[sort];
    this.load();
  };

  toggleOrder = () => {
    this.filters.order = this.filters.order === 'asc' ? 'desc' : 'asc';
    this.load();
  };

  resetFilters = () => {
    this.filters.search = DEFAULT_FILTERS.search;
    this.filters.world = DEFAULT_FILTERS.world;
    this.load();
  };

  /** Removes a deleted plan locally and refreshes counters in the background. */
  removePlan = (id: string) => {
    const plan = this.items.find((item) => item.id === id);

    if (!plan) return;

    this.items = this.items.filter((item) => item.id !== id);
    this.total = Math.max(0, this.total - 1);
    this.totalAll = Math.max(0, this.totalAll - 1);

    const island = plan.mission?.island;

    if (island) {
      this.worlds = this.worlds
        .map((world) => (world.name === island ? { ...world, count: world.count - 1 } : world))
        .filter((world) => world.count > 0);

      // The selected world has no plans left — show all of them.
      if (this.filters.world === island && !this.worlds.some((w) => w.name === island)) {
        this.setWorld('');
      }
    }
  };

  /** Clears the state on logout. */
  reset = () => {
    this.clearSearchTimer();
    this.abortController?.abort();
    this.abortController = null;

    this.filters = { ...DEFAULT_FILTERS };
    this.items = [];
    this.worlds = [];
    this.total = 0;
    this.totalAll = 0;
    this.isLoading = false;
    this.isLoaded = false;
    this.error = null;
  };

  private clearSearchTimer() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }
}

const profilePlansEntity = new ProfilePlans();

export { ProfilePlans, profilePlansEntity, DEFAULT_FILTERS };
export type { ProfilePlansFilters };
