import { makeAutoObservable } from 'mobx';

import { Marker, SWTMarkerID } from '@/entities/markers';
import { MarkerColor, MarkerType, stepSwtIconSize } from '@/shared/data/marker';

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
    MarkerType.hd_pickup,
    MarkerType.hd_warning,
    MarkerType.hd_unknown,
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

  controlsPosition = {
    x: 0,
    y: 0,
  };

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

  setControlsPosition = (x: number, y: number) => {
    this.controlsPosition = {
      x,
      y,
    };
  };

  setMarkerText = (text: string) => {
    this.marker.data[SWTMarkerID.text] = text;
  };

  /** Shift + wheel in SWT: switch icon size 0.7 / 1 / 1.3. */
  changeMarkerSize = (direction: number) => {
    this.marker.data[SWTMarkerID.size] = stepSwtIconSize(this.marker.data[SWTMarkerID.size], direction);
  };

  /** New marker keeps the last used type, color and size (like SWT in Arma 3). */
  resetMarker = () => {
    this.marker = generateNewMarker(
      this.marker.data[SWTMarkerID.type],
      this.marker.data[SWTMarkerID.color],
      this.currentSize
    );
  };

  get currentSize() {
    const size = this.marker.data[SWTMarkerID.size];
    return typeof size === 'number' ? size : 1;
  }

  /** Type / color used for quick markers and drawn lines / ellipses. */
  get currentType() {
    return this.marker.data[SWTMarkerID.type];
  }

  get currentColor() {
    return this.marker.data[SWTMarkerID.color];
  }
}

const createMarkerEntity = new CreateMarkerModel();

export { CreateMarkerModel, createMarkerEntity };
