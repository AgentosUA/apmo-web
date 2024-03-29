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

import {
  ArmaMarker,
  LocationMarker,
  MarkerIcon,
  UnitMarker,
} from '@/shared/ui/atoms/marker';
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
import { missionEntity } from '@/entities/mission';
import { useEffect } from 'react';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

const ArmaMap = observer(() => {
  const isMounted = useMounted();

  useEffect(() => {
    if (!missionEntity.island || !isMounted) return;

    if (missionEntity.island !== mapsEntity.selectedMap?.dir) {
      missionEntity.resetMission();
      toasterEntity.call({
        title: 'Map and mission mismatch',
        description: `Mission is not on ${mapsEntity.selectedMap?.name}!`,
      });
    }
  }, [missionEntity.island, isMounted]);

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
      mapSize={Number(mapsEntity.selectedMap.width)}
      dragging={!createMarkerEntity.isVisible}
      onDoubleClick={onDoubleClick}
      onZoomLevelChange={onZoomLevelChange}>
      <CreateMarker />

      {mapsEntity.locations.map((location, index) => (
        <LocationMarker key={index} data={location} />
      ))}

      {missionEntity.groups.map((group) => {
        return group.units.map((unit) => (
          <UnitMarker key={unit.id} data={unit} />
        ));
      })}

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
