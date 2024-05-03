import { MarkerType } from '@/shared/data/marker';
import { MissionMarker } from './types';

const getMissionMarkerType = (marker: MissionMarker) => {
  if ([marker.type, marker.markerType].includes('ELLIPSE')) return 'ellipse';
  if ([marker.type, marker.markerType].includes('RECTANGLE')) return 'line';

  return String(MarkerType[marker.type as keyof typeof MarkerType]);
};

export { getMissionMarkerType };
