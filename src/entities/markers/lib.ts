import { SWTMarkerID, type Marker, type SWTMarker } from '.';
import { markerColorNames, markerTypes } from '@/shared/data/marker';

const checkIsSWTMarkerType = (element: unknown[]) => {
  if (typeof element[0] !== 'string') return false;

  if (!Array.isArray(element[1])) return false;

  if (typeof element[1][0] !== 'number') return false;
  if (typeof element[1][1] !== 'number') return false;

  if (
    typeof element[2] === 'number' &&
    typeof element[3] === 'number' &&
    typeof element[4] === 'number' &&
    (typeof element[5] === 'number' || Array.isArray(element[5]))
  ) {
    // [["", [3788.34, 5266.41], -3, 8, 0, [60.0637, 56.3838], "", []]]
    return true;
  }

  return false;
};

const getValidSWTMarkers = (data: unknown): SWTMarker[] => {
  // console.log('data', data);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(checkIsSWTMarkerType) as SWTMarker[];
};

const getMarkerType = (marker: Marker) => {
  const markerId = marker.data[SWTMarkerID.type];

  if (markerId === -3) return 'ellipse';
  if (markerId === -2) return 'line';

  return markerTypes[markerId];
};

const getMarkerColorName = (marker: Marker) => {
  return markerColorNames[marker.data[SWTMarkerID.color]];
};

const getMarkerSize = (marker: Marker) => {
  return marker.data?.[SWTMarkerID.size];
};

const getMarkerDirection = (marker: Marker) => {
  return marker.data?.[SWTMarkerID.direction];
};

const getMarkerText = (marker: Marker) => {
  return marker.data[SWTMarkerID.text];
};

export {
  checkIsSWTMarkerType,
  getValidSWTMarkers,
  getMarkerType,
  getMarkerColorName,
  getMarkerText,
  getMarkerSize,
  getMarkerDirection
};
