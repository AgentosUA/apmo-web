import { Marker, SWTMarkerID } from '@/entities/markers';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { generateRandomId } from '@/shared/utils/string';
import { makeAutoObservable } from 'mobx';

class CreateMarkerModel {
  constructor(isVisible = false) {
    makeAutoObservable(this);

    this.isVisible = isVisible;
  }

  isVisible = false;

  marker: Marker = {
    id: generateRandomId(),
    data: ['', [0, 0], MarkerType.hd_dot, MarkerColor.ColorBlack, 0, 0, '', []],
  };

  open = () => {
    this.isVisible = true;
  };

  close = () => {
    this.isVisible = false;
  };

  setMarkerColor = (color: MarkerColor) => {
    this.marker.data[SWTMarkerID.color] = color;
  };

  setMarkerPosition = (x: number, y: number) => {
    this.marker.data[SWTMarkerID.coordinates] = [x, y];
  };

  setMarkerText = (text: string) => {
    this.marker.data[SWTMarkerID.text] = text;
  };

  resetMarker = () => {
    this.marker = {
      id: generateRandomId(),
      data: [
        '',
        [0, 0],
        MarkerType.hd_dot,
        MarkerColor.ColorBlack,
        0,
        0,
        '',
        [],
      ],
    };
  };
}

const createMarkerEntity = new CreateMarkerModel();

export { CreateMarkerModel, createMarkerEntity };
