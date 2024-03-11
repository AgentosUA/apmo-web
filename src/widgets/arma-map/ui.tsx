'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(
  () => import('@/shared/ui/atoms/basic-map/ui').then((m) => m.BasicMap),
  {
    ssr: false,
  }
);

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerID, markersEntity } from '@/entities/markers';
import { observer } from 'mobx-react-lite';

import { ArmaMarker, MarkerIcon } from '@/shared/ui/atoms/marker';
import { useMounted } from '@/shared/ui/hooks';

import { CreateMarker } from '@/features/markers/create-marker/ui';
import { createMarkerEntity } from '@/features/markers/create-marker';
import {
  getMarkerColorName,
  getMarkerDirection,
  getMarkerSize,
  getMarkerText,
  getMarkerType,
} from '@/entities/markers/lib';

import { armaMapEntity } from './model';
import { LeafletMouseEvent } from 'leaflet';

const ArmaMap = observer(() => {
  const isMounted = useMounted();
  if (
    !isMounted ||
    !mapsEntity.selectedMap ||
    !Number(mapsEntity.selectedMap?.width)
  )
    return null;

  const onDoubleClick = (event: LeafletMouseEvent) => {
    createMarkerEntity.open();
    createMarkerEntity.setMarkerPosition(event.latlng.lng, event.latlng.lat);

    createMarkerEntity.setControlsPosition(
      event.originalEvent.x,
      event.originalEvent.y
    );
  };

  const onZoomLevelChange = (zoomLevel: number) => {
    armaMapEntity.setZoomLevel(zoomLevel);
  };

  return (
    <BasicMap
      name={mapsEntity.selectedMap.dir}
      minZoom={0}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width) ?? 0}
      dragging={!createMarkerEntity.isVisible}
      onDoubleClick={onDoubleClick}
      onZoomLevelChange={onZoomLevelChange}>
      <CreateMarker />
      {markersEntity.swtMarkers.map((marker) => {
        return (
          <ArmaMarker
            key={marker.id}
            icon={MarkerIcon(
              getMarkerType(marker),
              getMarkerColorName(marker),
              getMarkerSize(marker),
              armaMapEntity.zoomLevel
            )}
            direction={getMarkerDirection(marker)}
            x={marker.data[SWTMarkerID.coordinates][0]}
            y={marker.data[SWTMarkerID.coordinates][1]}
            onUpdatePosition={(x, y) =>
              markersEntity.updateMarker(marker.id, x, y)
            }
            onDelete={() => markersEntity.deleteMarker(marker.id)}
            color={getMarkerColorName(marker)}
            draggable>
            {getMarkerText(marker)}
          </ArmaMarker>
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
