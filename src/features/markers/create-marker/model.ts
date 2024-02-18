import { Marker, SWTMarkerID } from '@/entities/markers';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { makeAutoObservable } from 'mobx';

import { generateNewMarker } from './lib';

class CreateMarkerModel {
  constructor(isVisible = false) {
    makeAutoObservable(this);

    this.isVisible = isVisible;
  }

  isVisible = false;
  isAllListsVisible = false;

  defaultSWTMarkers = [
    MarkerType.mil_dot,
    MarkerType.b_inf,
    MarkerType.b_armor,
    MarkerType.mil_pickup,
    MarkerType.mil_warning,
    MarkerType.mil_unknown,
  ];

  defaultSWTColors = [
    MarkerColor.ColorBlue,
    MarkerColor.ColorRed,
    MarkerColor.ColorGreen,
    MarkerColor.ColorBlack,
    MarkerColor.ColorWhite,
    MarkerColor.ColorYellow,
  ];

  marker: Marker = generateNewMarker();

  open = () => {
    this.isVisible = true;
  };

  close = () => {
    this.isVisible = false;
  };

  switchAllListsVisibility = () => {
    this.isAllListsVisible = !this.isAllListsVisible;
  };

  openAllLists = () => {
    this.isAllListsVisible = true;
  };

  closeAllList = () => {
    this.isAllListsVisible = false;
  };

  setMarkerColor = (color: MarkerColor) => {
    this.marker.data[SWTMarkerID.color] = color;
  };

  setMarkerType = (type: MarkerType) => {
    this.marker.data[SWTMarkerID.type] = type;
  };

  setMarkerPosition = (x: number, y: number) => {
    this.marker.data[SWTMarkerID.coordinates] = [x, y];
  };

  setMarkerText = (text: string) => {
    this.marker.data[SWTMarkerID.text] = text;
  };

  resetMarker = () => {
    this.marker = generateNewMarker();
  };
}

const createMarkerEntity = new CreateMarkerModel();

export { CreateMarkerModel, createMarkerEntity };
