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

  marker: Marker = {
    id: generateRandomId(),
    data: ['', [0, 0], MarkerType.mil_dot, MarkerColor.ColorBlue, 0, 0, '', []],
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
