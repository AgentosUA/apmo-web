import { MarkerType } from '@/shared/data/marker';

import { MissionMarker } from './types';

const getMissionMarkerType = (marker: MissionMarker) => {
  if ([marker.type, marker.markerType].includes('ELLIPSE')) {
    return 'ellipse';
  }

  if ([marker.type, marker.markerType].includes('RECTANGLE')) {
    return 'line';
  }

  return String(MarkerType[marker.type as keyof typeof MarkerType]);
};

const getIslandClassNameByPboFile = (file: File) => {
  return file?.name?.split?.('.pbo')?.[0]?.split('.')?.[1] ?? '';
};

/**
 * Marker a briefing link (`<marker name='…'>`) points to. Arma marker names are
 * not case-sensitive (`'blue'` finds `Blue`), the exact spelling wins.
 */
const findMissionMarkerByName = (markers: MissionMarker[] | undefined, name: string) => {
  if (!markers?.length || !name) return null;

  const lowerName = name.toLowerCase();

  return (
    markers.find((marker) => marker.name === name) ??
    markers.find((marker) => marker.name?.toLowerCase() === lowerName) ??
    null
  );
};

export { getMissionMarkerType, getIslandClassNameByPboFile, findMissionMarkerByName };
