import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable, observable } from 'mobx';
import { getValidSWTMarkers } from './lib';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

enum SWTMarkerID {
  text,
  coordinates,
  type,
  color,
}

type SWTMarker = [
  string,
  [number, number],
  number,
  number,
  number,
  number,
  '',
  []
];

type Marker = {
  id: string | number;
  data: SWTMarker;
};

class MarkersModel {
  constructor() {
    makeAutoObservable(this);
  }

  isMissionLoading = false;
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
    } catch (error) {
      console.log(error);
    } finally {
      this.isSWTLoading = false;
    }
  };

  SWTMarkerToClipboard = () => {
    const text = JSON.stringify(this.swtMarkers.map((marker) => marker.data));
    navigator.clipboard.writeText(text);

    toasterEntity.callToaster({
      title: 'Markers copied',
      description: 'Markers copied to clipboard',
      type: 'radio',
      timer: 4000,
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
