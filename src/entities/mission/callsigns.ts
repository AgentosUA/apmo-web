import type { Group, Side, Unit } from './types';

/**
 * Group callsigns (Alpha 1-1, Alpha 1-2 …) as Arma shows them in the lobby.
 *
 * The API fills `group.callsign` when a mission is parsed
 * (apmo-api `src/modules/missions/callsigns.ts`). Plans saved before that have
 * no `callsign`, so the same algorithm is repeated here — keep them in sync.
 *
 * Mission makers often override the order via the unit description:
 * `Командир@Альфа 2-3` / `Squad Leader@Alpha 2-3` (same rule as pbo-parser).
 */

/** `@Alpha 2-3`, `@Альфа 2-3`, `@alpha 2 - 3` (Latin or Cyrillic, any case). */
const MANUAL_CALLSIGN_REGEXP = /@\s*(?:alpha|альфа)\s*(\d+)\s*-\s*(\d+)/iu;

/** Everything from the first `@` — that's the lobby group name, not the slot. */
const CALLSIGN_SUFFIX_REGEXP = /\s*@.*$/u;

/** Order index mission makers put into slot names: `1. `, `2) `, `03 - `. */
const LEADING_INDEX_REGEXP = /^\s*\d+\s*[.):-]\s*/u;

const SQUAD_SIZE = 6;

const formatCallsign = (squad: number, position: number) => `Alpha ${squad}-${position}`;

const parseCallsign = (callsign: string) => {
  const match = /^Alpha\s+(\d+)-(\d+)$/i.exec(callsign.trim());
  return match ? { squad: Number(match[1]), position: Number(match[2]) } : null;
};

/** Alpha 1-1 before Alpha 1-2 before Alpha 2-1; non-Alpha names go last. */
const compareCallsigns = (a: string, b: string) => {
  const pa = parseCallsign(a);
  const pb = parseCallsign(b);

  if (pa && pb) return pa.squad - pb.squad || pa.position - pb.position;
  if (pa) return -1;
  if (pb) return 1;
  return a.localeCompare(b);
};

const extractManualCallsign = (description?: string | null) => {
  if (!description) return null;

  const match = MANUAL_CALLSIGN_REGEXP.exec(description);
  if (!match) return null;

  const squad = Number.parseInt(match[1], 10);
  const position = Number.parseInt(match[2], 10);
  if (!Number.isFinite(squad) || !Number.isFinite(position)) return null;

  return formatCallsign(squad, position);
};

/** Slot name without the `@callsign` part, falls back to the unit class. */
const getUnitName = (unit: Pick<Unit, 'description' | 'type'>) =>
  (unit.description ?? '').replace(CALLSIGN_SUFFIX_REGEXP, '').trim() || unit.type;

/**
 * Slot row text. Mission makers usually number slots themselves (`1. Командир`) —
 * then it's shown as is; otherwise the position in the group is prefixed.
 */
const getSlotLabel = (unit: Pick<Unit, 'description' | 'type'>, index: number) => {
  const name = getUnitName(unit);
  return LEADING_INDEX_REGEXP.test(name) ? name : `${index + 1}. ${name}`;
};

type GroupWithCallsign = {
  group: Group;
  callsign: string;
  /** Playable units only — what the lobby shows. */
  units: Unit[];
  /** First playable unit: the group's position on the map. */
  leader: Unit;
};

/** Callsigns for groups of one side, computed locally (see file comment). */
const computeCallsigns = (groups: { group: Group; units: Unit[] }[]) => {
  const manual = groups.map(
    ({ units }) =>
      units.map((unit) => extractManualCallsign(unit.description)).find(Boolean) ?? null
  );
  const taken = new Set(manual.filter(Boolean));

  let counter = 0;
  const nextFree = () => {
    let callsign: string;
    do {
      callsign = formatCallsign(Math.floor(counter / SQUAD_SIZE) + 1, (counter % SQUAD_SIZE) + 1);
      counter++;
    } while (taken.has(callsign));
    taken.add(callsign);
    return callsign;
  };

  return manual.map((callsign) => callsign ?? nextFree());
};

/**
 * Lobby groups of a side, sorted by callsign. Groups without playable units are
 * skipped. Uses `group.callsign` from the API when every group has it.
 */
const getGroupsWithCallsigns = (groups: Group[] = [], side: Side): GroupWithCallsign[] => {
  // A mission with no playable flags at all (broken export) — show every group.
  const hasPlayable = groups.some((group) => group.units.some((unit) => unit.isPlayable));

  const sideGroups = groups
    .filter((group) => group.side === side)
    .map((group) => ({
      group,
      units: hasPlayable ? group.units.filter((unit) => unit.isPlayable) : group.units,
    }))
    .filter(({ units }) => units.length > 0);

  const fromApi = sideGroups.every(({ group }) => typeof group.callsign === 'string');
  const callsigns = fromApi
    ? sideGroups.map(({ group }) => group.callsign as string)
    : computeCallsigns(sideGroups);

  return sideGroups
    .map(({ group, units }, index) => ({
      group,
      units,
      leader: units[0],
      callsign: callsigns[index],
    }))
    .sort((a, b) => compareCallsigns(a.callsign, b.callsign));
};

export { extractManualCallsign, getGroupsWithCallsigns, getSlotLabel, getUnitName };
export type { GroupWithCallsign };
