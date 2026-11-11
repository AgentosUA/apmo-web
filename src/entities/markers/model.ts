import i18next from 'i18next';
import { makeAutoObservable, toJS } from 'mobx';

import { i18n } from '@/shared/lib/i18n/config';
import { stepSwtIconSize } from '@/shared/data/marker';
import { parseSqfOrJson, toSqf } from '@/shared/lib/sqf';
import type { MarkerOp } from '@/shared/sdk/realtime';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { generateRandomId } from '@/shared/utils/string';

import { getValidSWTMarkers } from './lib';



enum SWTMarkerID {
  text,
  coordinates,
  type, // line -2, circle -3
  color,
  direction,
  size,
}

type SWTMarker = [
  string, // text
  [number, number], // coordinates
  number, // type
  number, // color
  number, // direction
  number | number[], // size
  '', // ?
  [] // ?
];
// [["",[19282.3,7461.75],-3,9,0,[434.174,485.828],"",[]]]
// [["", [3788.34, 5266.41], -3, 8, 0, [60.0637, 56.3838], "", []]]

type Marker = {
  id: string | number;
  data: SWTMarker;
};

type MarkersChangeListener = (op: MarkerOp) => void;

class MarkersModel {
  constructor() {
    makeAutoObservable<MarkersModel, 'listeners'>(this, { listeners: false });
  }

  playersDisplayMode: 'groups' | 'players' = 'groups';
  isPlayersNameVisible = false;
  isSWTLoading = false;
  /** Viewing a plan without edit rights: every SWT change is ignored. */
  isReadOnly = false;
  missionsMarkers: Marker[] = [];
  swtMarkers: Marker[] = [];

  /** Notified about changes made by this user (not about `applyRemoteOp`). */
  private listeners = new Set<MarkersChangeListener>();

  subscribe = (listener: MarkersChangeListener) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(op: MarkerOp) {
    this.listeners.forEach((listener) => listener(op));
  }

  private emitUpdate(marker: Marker) {
    this.emit({ type: 'update', marker: toJS(marker) });
  }

  setReadOnly = (value: boolean) => {
    this.isReadOnly = value;
  };

  /** A change from another user (or the server state): applied silently. */
  applyRemoteOp = (op: MarkerOp) => {
    switch (op.type) {
      case 'add': {
        const marker = op.marker as Marker;
        const index = this.swtMarkers.findIndex((item) => item.id === marker.id);

        if (index === -1) this.swtMarkers.push(marker);
        else this.swtMarkers[index] = marker;
        break;
      }
      case 'update': {
        const index = this.swtMarkers.findIndex((item) => item.id === op.marker.id);

        if (index !== -1) this.swtMarkers[index] = op.marker as Marker;
        break;
      }
      case 'remove':
        this.swtMarkers = this.swtMarkers.filter((item) => item.id !== op.id);
        break;
      case 'set':
        this.swtMarkers = op.markers as Marker[];
        break;
    }
  };

  addMarker = (marker: Marker) => {
    if (this.isReadOnly) return;

    this.swtMarkers = [...this.swtMarkers, marker];
    this.emit({ type: 'add', marker: toJS(marker) });
  };

  deleteMarker = (id: number | string) => {
    if (this.isReadOnly) return;

    const index = this.swtMarkers.findIndex((marker) => marker.id === id);

    if (index === -1) return;

    this.swtMarkers.splice(index, 1);
    this.emit({ type: 'remove', id });
  };

  switchPlayersName = () => {
    this.isPlayersNameVisible = !this.isPlayersNameVisible;
  };

  showAllPlayers = () => {
    this.playersDisplayMode = 'players';
  };

  showGroupsOnly = () => {
    this.playersDisplayMode = 'groups';
  };

  /** Replaces the markers without notifying listeners (loading a plan). */
  setSWTMarkers = (markers: Marker[]) => {
    this.swtMarkers = markers;
  };

  setMissionMarkers = (markers: []) => {
    this.missionsMarkers = markers;
  };

  clearMissionMarkers = () => {
    this.missionsMarkers = [];
  };

  /** "Clear markers" — a user change, synced with the plan. */
  clearSWTMarkers = () => {
    if (this.isReadOnly) return;

    this.swtMarkers = [];
    this.emit({ type: 'set', markers: [] });
  };

  SWTMarkerFromClipboard = async () => {
    if (this.isReadOnly) return;

    try {
      this.isSWTLoading = true;

      const text = await navigator.clipboard.readText();
      // SWT clipboard data is SQF (`"` is escaped as `""`), not JSON.
      const data = parseSqfOrJson(text);

      const swtMarkers = getValidSWTMarkers(data);

      const parsedMarkers = swtMarkers.map((item) => ({
        id: generateRandomId(),
        data: item,
      }));

      this.setSWTMarkers([...this.swtMarkers, ...(parsedMarkers as Marker[])]);
      this.emit({ type: 'set', markers: toJS(this.swtMarkers) });

      toasterEntity.call({
        title: 'entities:markers:loadedTitle',
        description: i18next.t(`entities:markers:loadedDescription`, {
          count: parsedMarkers.length,
        }),
      });
    } catch (error) {
      console.error(error);
      toasterEntity.call({
        title: 'entities:markers:loadFailedTitle',
        description: 'entities:markers:loadFailedDescription',
      });
    } finally {
      this.isSWTLoading = false;
    }
  };

  SWTMarkerToClipboard = () => {
    // SQF array, loadable by SWT ("Load from clipboard") in Arma 3.
    const text = toSqf(this.swtMarkers.map((marker) => marker.data));
    navigator.clipboard.writeText(text);

    toasterEntity.call({
      title: 'entities:markers:copiedTitle',
      description: 'entities:markers:copiedDescription',
    });
  };

  updateMarker = (id: string | number, x: number, y: number) => {
    if (this.isReadOnly) return;

    const index = this.swtMarkers.findIndex((marker) => marker.id === id);

    if (index === -1) return;

    this.swtMarkers[index].data[SWTMarkerID.coordinates] = [x, y];
    this.emitUpdate(this.swtMarkers[index]);
  };

  /** Shift + wheel (SWT): switch icon size 0.7 / 1 / 1.3. */
  changeMarkerSize = (id: string | number, direction: number) => {
    if (this.isReadOnly) return;

    const marker = this.swtMarkers.find((item) => item.id === id);
    if (!marker || Array.isArray(marker.data[SWTMarkerID.size])) return;

    const size = stepSwtIconSize(marker.data[SWTMarkerID.size], direction);
    if (size === marker.data[SWTMarkerID.size]) return;

    marker.data[SWTMarkerID.size] = size;
    this.emitUpdate(marker);
  };

  updateMarkerDirection = (id: string | number, direction: number) => {
    if (this.isReadOnly) return;

    const marker = this.swtMarkers.find((item) => item.id === id);
    if (!marker) return;

    marker.data[SWTMarkerID.direction] = direction;
    this.emitUpdate(marker);
  };

  /** Leaving the map / plan: local reset, not synced. */
  clearMarkers = () => {
    this.missionsMarkers = [];
    this.swtMarkers = [];
    this.isReadOnly = false;
  };
}

const markersEntity = new MarkersModel();

export { MarkersModel, SWTMarkerID, markersEntity };

export type { Marker, SWTMarker };
