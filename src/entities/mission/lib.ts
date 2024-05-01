import { MarkerType } from '@/shared/data/marker';
import { MissionMarker } from './types';

const getMissionMarkerType = (marker: MissionMarker) => {
  if (marker.type === 'ELLIPSE') return 'ellipse';
  if (marker.type === 'RECTA') return 'line';

  return String(MarkerType[marker.type as keyof typeof MarkerType]);
};

export { getMissionMarkerType };
