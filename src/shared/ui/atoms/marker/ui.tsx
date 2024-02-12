import { markerNames } from '@/shared/data/marker';
import { Icon } from 'leaflet';

const MarkerIcons = markerNames.map(
  (markerName) =>
    new Icon({
      iconUrl: `/markers/${markerName}.png`,
      iconSize: [32, 32], // size of the icon
      iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
      popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
    })
);

export { MarkerIcons };
