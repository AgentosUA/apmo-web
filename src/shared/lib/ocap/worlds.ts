/**
 * Map database: worlds merged from several OCAP-compatible sources.
 *
 * Every world is described by a `map.json` that lives next to its tiles, like
 * OCAP2/web `ApiClient.getWorldConfig()` (ui/src/data/apiClient.ts). Sources,
 * in priority order (first one that has the world wins):
 *
 *   1. Self-hosted OCAP web servers – `NEXT_PUBLIC_OCAP_URL` and
 *      `NEXT_PUBLIC_OCAP_URLS` (comma separated). Default: VTG replays
 *      (https://replays.vtg.in.ua) – MapLibre vector packs + previews.
 *      World list: GET {server}/api/v1/worlds, maps: {server}/images/maps/{world}.
 *   2. Optional bare maps folder – `NEXT_PUBLIC_OCAP_MAPS_URL` ({world}/map.json).
 *   3. OCAP map CDN – https://maps.ocap2.com (worlds.json + raster tiles).
 *
 * (pmtiles.ocap2.com only serves bare PMTiles archives as TileJSON, without
 * map.json or styles, so it is not a map source.)
 *
 * `shared/data/worlds.ts` is a snapshot of the lists, used if requests fail.
 */
import { worldCatalog, WorldCatalogEntry } from '@/shared/data/worlds';

/** Per-world map configuration (OCAP `map.json`). */
type WorldConfig = {
  worldName: string;
  worldSize: number;
  imageSize?: number;
  maxZoom: number;
  minZoom: number;
  tileSize?: number;
  multiplier?: number;
  /** True when MapLibre + PMTiles rendering is available for this world. */
  maplibre?: boolean;
  /** Base URL for tile assets (set during probing). */
  tileBaseUrl?: string;
  hasTopo?: boolean;
  hasTopoDark?: boolean;
  hasTopoRelief?: boolean;
  hasColorRelief?: boolean;
  attribution?: string;
  displayName?: string;
  /** Id of the map source the config came from. */
  source?: string;
};

type WorldInfo = WorldCatalogEntry;

type MapSource = {
  id: string;
  label: string;
  /** URL of the world list (OCAP `/api/v1/worlds` or CDN `worlds.json`). */
  worldsUrl?: string;
  /** Folder that contains `{world}/map.json` and the tiles. */
  mapsBase: string;
  /** Source serves `{world}/preview_512.png`. */
  hasPreviews: boolean;
};

const trimSlash = (url?: string) => (url ?? '').trim().replace(/\/+$/, '');

const OCAP_CDN = 'https://maps.ocap2.com';
const DEFAULT_OCAP_SERVERS = ['https://replays.vtg.in.ua'];

const KNOWN_SERVERS: Record<string, { id: string; label: string }> = {
  'replays.vtg.in.ua': { id: 'vtg', label: 'VTG' },
};

const serverSource = (url: string): MapSource => {
  const base = trimSlash(url);
  const host = new URL(base).host;
  return {
    id: KNOWN_SERVERS[host]?.id ?? host,
    label: KNOWN_SERVERS[host]?.label ?? host,
    worldsUrl: `${base}/api/v1/worlds`,
    mapsBase: `${base}/images/maps`,
    hasPreviews: true,
  };
};

const buildSources = (): MapSource[] => {
  const servers = [
    process.env.NEXT_PUBLIC_OCAP_URL,
    // Empty value (e.g. an unset Docker build arg) → defaults.
    ...(process.env.NEXT_PUBLIC_OCAP_URLS || DEFAULT_OCAP_SERVERS.join(',')).split(','),
  ]
    .map(trimSlash)
    .filter(Boolean);

  const sources: MapSource[] = [];
  const seen = new Set<string>();

  servers.forEach((url) => {
    try {
      const source = serverSource(url);
      if (seen.has(source.id)) return;
      seen.add(source.id);
      sources.push(source);
    } catch {
      console.warn(`Invalid OCAP server URL: ${url}`);
    }
  });

  const mapsUrl = trimSlash(process.env.NEXT_PUBLIC_OCAP_MAPS_URL);
  if (mapsUrl) {
    sources.push({ id: 'maps', label: 'Maps', mapsBase: mapsUrl, hasPreviews: true });
  }

  sources.push({
    id: 'ocap',
    label: 'OCAP',
    worldsUrl: `${OCAP_CDN}/worlds.json`,
    mapsBase: OCAP_CDN,
    hasPreviews: false,
  });

  return sources;
};

const MAP_SOURCES = buildSources();

const getMapSource = (id?: string) => MAP_SOURCES.find((source) => source.id === id);

const DEFAULTS: Omit<WorldConfig, 'worldName'> = {
  worldSize: 16384,
  imageSize: 16384,
  multiplier: 1,
  maxZoom: 6,
  minZoom: 0,
};

const normalizeWorldName = (worldName: string) => worldName.trim().toLowerCase();

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

// --------------- world list ---------------

/** worldName → source ids that have it (filled by getWorlds / snapshot). */
const worldSources = new Map<string, string[]>();
/** worldName → display name (live lists override the snapshot). */
const worldNames = new Map<string, string>();
worldCatalog.forEach((world) => {
  worldSources.set(world.name, world.sources ?? []);
  worldNames.set(world.name, world.displayName);
});

const findCatalogEntry = (worldName?: string | null) => {
  if (!worldName) return undefined;
  const name = normalizeWorldName(worldName);
  return worldCatalog.find((world) => world.name === name);
};

type RemoteWorld = { name?: string; worldName?: string; worldname?: string; displayName?: string };

let worldsPromise: Promise<WorldInfo[]> | null = null;

/**
 * Worlds of all map sources merged by worldName, sorted by display name.
 * Display name comes from the highest-priority source that has the world.
 */
const getWorlds = (): Promise<WorldInfo[]> => {
  if (worldsPromise) return worldsPromise;

  worldsPromise = (async () => {
    const lists = await Promise.all(
      MAP_SOURCES.map(async (source) => {
        const live = source.worldsUrl ? await fetchJson<RemoteWorld[]>(source.worldsUrl) : null;
        // Fallback: snapshot entries of this source.
        const worlds: RemoteWorld[] = Array.isArray(live)
          ? live
          : worldCatalog.filter((world) => world.sources?.includes(source.id));
        return { source, worlds };
      })
    );

    const byName = new Map<string, WorldInfo>();

    lists.forEach(({ source, worlds }) => {
      worlds.forEach((world) => {
        const name = normalizeWorldName(world.worldName || world.worldname || world.name || '');
        if (!name) return;

        const existing = byName.get(name);
        if (existing) {
          if (!existing.sources?.includes(source.id)) existing.sources = [...(existing.sources ?? []), source.id];
          return;
        }

        const known = findCatalogEntry(name);
        byName.set(name, {
          name,
          displayName: (world.displayName || known?.displayName || world.name || name).trim(),
          sources: [source.id],
          localPreview: known?.localPreview,
          locations: known?.locations,
        });
      });
    });

    // Every source failed → snapshot as is.
    const result = byName.size ? [...byName.values()] : worldCatalog.map((world) => ({ ...world }));

    result.forEach((world) => {
      worldSources.set(world.name, world.sources ?? []);
      worldNames.set(world.name, world.displayName);
    });

    return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  })();

  return worldsPromise;
};

// --------------- map config ---------------

const configCache = new Map<string, Promise<WorldConfig | null>>();

const loadConfigFrom = async (source: MapSource, name: string): Promise<WorldConfig | null> => {
  const base = `${source.mapsBase}/${encodeURIComponent(name)}`;
  const config = await fetchJson<Partial<WorldConfig>>(`${base}/map.json`);
  if (!config) return null;

  return {
    ...DEFAULTS,
    ...config,
    // The OCAP CDN only has raster tiles.
    maplibre: source.id === 'ocap' ? false : Boolean(config.maplibre),
    tileBaseUrl: base,
    worldName: name,
    source: source.id,
  };
};

/**
 * Resolve the map configuration for an Arma worldName from the first source
 * that has it (sources known to have the world are tried first).
 * Returns `null` if no source has the world.
 */
const getWorldConfig = (worldName: string, preferredSource?: string): Promise<WorldConfig | null> => {
  const name = normalizeWorldName(worldName);
  const cacheKey = `${name}|${preferredSource ?? ''}`;
  const cached = configCache.get(cacheKey);
  if (cached) return cached;

  const known = worldSources.get(name) ?? [];
  const ordered = [...MAP_SOURCES].sort((a, b) => {
    const score = (source: MapSource) =>
      source.id === preferredSource ? -2 : known.includes(source.id) ? -1 : 0;
    return score(a) - score(b) || MAP_SOURCES.indexOf(a) - MAP_SOURCES.indexOf(b);
  });

  const promise = (async () => {
    for (const source of ordered) {
      const config = await loadConfigFrom(source, name);
      if (config) return config;
    }
    return null;
  })().then((config) => {
    // Do not cache negative results forever (network hiccups).
    if (!config) configCache.delete(cacheKey);
    return config;
  });

  configCache.set(cacheKey, promise);
  return promise;
};

// --------------- names / previews / locations ---------------

/** Human readable world name; falls back to the worldName itself. */
const getWorldDisplayName = (worldName?: string | null) => {
  if (!worldName) return 'Unknown';
  return worldNames.get(normalizeWorldName(worldName)) ?? worldName;
};

/** Labels of the sources that have the world, e.g. ["VTG", "OCAP"]. */
const getWorldSourceLabels = (worldName?: string | null) => {
  if (!worldName) return [];
  return (worldSources.get(normalizeWorldName(worldName)) ?? [])
    .map((id) => getMapSource(id)?.label)
    .filter((label): label is string => Boolean(label));
};

/**
 * Preview image candidates, in priority order (source previews → legacy local
 * preview → lowest-zoom OCAP CDN tile → placeholder). Use with an <img> that
 * advances on `onError`.
 */
const getWorldPreviewCandidates = (worldName?: string | null): string[] => {
  const placeholder = '/maps/no-island.jpg';
  if (!worldName) return [placeholder];

  const name = normalizeWorldName(worldName);
  const encoded = encodeURIComponent(name);
  const sources = worldSources.get(name) ?? [];
  const candidates: string[] = [];

  MAP_SOURCES.filter((source) => source.hasPreviews && sources.includes(source.id)).forEach((source) =>
    candidates.push(`${source.mapsBase}/${encoded}/preview_512.png`)
  );

  const local = findCatalogEntry(worldName)?.localPreview;
  if (local) candidates.push(local);

  if (sources.includes('ocap') || !sources.length) candidates.push(`${OCAP_CDN}/${encoded}/0/0/0.png`);

  candidates.push(placeholder);
  return candidates;
};

/** Legacy location labels file name (in /public/locations). */
const getWorldLocationsFile = (worldName?: string | null) => {
  if (!worldName) return undefined;
  return findCatalogEntry(worldName)?.locations ?? normalizeWorldName(worldName);
};

export {
  MAP_SOURCES,
  getMapSource,
  getWorldConfig,
  getWorlds,
  getWorldDisplayName,
  getWorldSourceLabels,
  getWorldPreviewCandidates,
  getWorldLocationsFile,
  normalizeWorldName,
  findCatalogEntry,
};

export type { WorldConfig, WorldInfo, MapSource };
