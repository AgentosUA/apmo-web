import type { SWTMarker } from '.';

const checkIsSWTMarkerType = (element: unknown[]) => {
  if (typeof element[0] !== 'string') return false;

  if (!Array.isArray(element[1])) return false;

  if (typeof element[1][0] !== 'number') return false;
  if (typeof element[1][1] !== 'number') return false;

  if (
    typeof element[2] === 'number' &&
    typeof element[3] === 'number' &&
    typeof element[4] === 'number' &&
    typeof element[5] === 'number'
  ) {
    return true;
  }

  return false;
};

const getValidSWTMarkers = (data: unknown): SWTMarker[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(checkIsSWTMarkerType) as SWTMarker[];
};

export { checkIsSWTMarkerType, getValidSWTMarkers };
