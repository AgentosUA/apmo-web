import { Marker, CircleMarker } from 'react-leaflet';

type MarkerVariant = 'marker' | 'circle' | 'line';

const getMarkerByType = (type: MarkerVariant) => {
  switch (type) {
    case 'circle':
      return CircleMarker;
    default:
      return Marker;
  }
};

export { getMarkerByType };

export type { MarkerVariant };
