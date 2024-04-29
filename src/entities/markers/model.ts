import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

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

// [["", [3788.34, 5266.41], -3, 8, 0, [60.0637, 56.3838], "", []]]

type Marker = {
  id: string | number;
  data: SWTMarker;
};

class MarkersModel {
  constructor() {
    makeAutoObservable(this);
  }

  playersDisplayMode: 'groups' | 'players' = 'groups';
  isPlayersNameVisible = false;
  isSWTLoading = false;
  missionsMarkers: Marker[] = [];
  swtMarkers: Marker[] = [];

  addMarker = (marker: Marker) => {
    const markers = [...this.swtMarkers, marker];
    this.swtMarkers = markers;
  };

  deleteMarker = (id: number | string) => {
    const index = this.swtMarkers.findIndex((marker) => marker.id === id);

    if (index === -1) return;

    this.swtMarkers.splice(index, 1);
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

  setSWTMarkers = (markers: Marker[]) => {
    this.swtMarkers = markers;
  };

  setMissionMarkers = (markers: []) => {
    this.missionsMarkers = markers;
  };

  clearMissionMarkers = () => {
    this.swtMarkers = [];
  };

  clearSWTMarkers = () => {
    this.swtMarkers = [];
  };

  SWTMarkerFromClipboard = async () => {
    try {
      this.isSWTLoading = true;

      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text) as unknown;

      const swtMarkers = getValidSWTMarkers(data);

      const parsedMarkers = swtMarkers.map((item) => ({
        id: generateRandomId(),
        data: item,
      }));

      this.setSWTMarkers([...this.swtMarkers, ...(parsedMarkers as Marker[])]);

      toasterEntity.call({
        title: 'Markers loaded',
        description: `${parsedMarkers.length} Markers loaded to the map`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.isSWTLoading = false;
    }
  };

  SWTMarkerToClipboard = () => {
    const text = JSON.stringify(this.swtMarkers.map((marker) => marker.data));
    navigator.clipboard.writeText(text);

    toasterEntity.call({
      title: 'Markers copied',
      description: 'Markers copied to clipboard',
    });
  };

  updateMarker = (id: string | number, x: number, y: number) => {
    const index = this.swtMarkers.findIndex((marker) => marker.id === id);

    if (index === -1) return;

    this.swtMarkers[index].data[SWTMarkerID.coordinates] = [x, y];
  };

  clearMarkers = () => {
    this.clearMissionMarkers();
    this.clearSWTMarkers();
  };
}

const markersEntity = new MarkersModel();

export { MarkersModel, SWTMarkerID, markersEntity };

export type { Marker, SWTMarker };
