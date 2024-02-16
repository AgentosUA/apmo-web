import { Marker } from '@/entities/markers';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';

class CreateMarkerModel {
  constructor() {
    makeAutoObservable(this);
  }

  marker: Marker = {
    id: generateRandomId(),
    data: ['', [0, 0], MarkerType.hd_dot, MarkerColor.ColorBlack, 0, 0, '', []],
  };

  setMarkerColor = (color: MarkerColor) => {
    this.marker.data[3] = color;
  };

  resetMarker = () => {
    // this.marker = null;
  };
}

const createMarkerEntity = new CreateMarkerModel();

export { CreateMarkerModel, createMarkerEntity };
