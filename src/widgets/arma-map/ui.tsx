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
  VehicleMarker,
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

import { LeafletMouseEvent } from 'leaflet';
import { missionEntity } from '@/entities/mission';
import { useEffect } from 'react';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { View } from '@/shared/ui/quarks/view';
import { MarkerColor, MarkerType } from '@/shared/data/marker';
import { getMissionMarkerType } from '@/entities/mission/lib';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { callsigns } from '@/entities/mission/data';

const ArmaMap = observer(() => {
  const isMounted = useMounted();

  useEffect(() => {
    if (!missionEntity.island || !isMounted) return;

    if (missionEntity.island !== mapsEntity.selectedMap?.id) {
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
    basicMapEntity.setZoomLevel(zoomLevel);
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

      <View.Condition if={markersEntity.playersDisplayMode === 'players'}>
        {missionEntity.groups.map((group) => {
          return group.units.map((unit) => (
            <UnitMarker
              key={unit.id}
              data={unit}
              isAllVisible={markersEntity.isPlayersNameVisible}
            />
          ));
        })}
      </View.Condition>

      <View.Condition if={markersEntity.playersDisplayMode === 'groups'}>
        {missionEntity.groups
          .filter((group) => group.side === 'West')
          .map((group, index) => {
            return group.units.slice(0, 1).map((unit) => (
              <UnitMarker
                key={unit.id}
                data={{
                  ...unit,
                  description: callsigns[index],
                }}
                isAllVisible={markersEntity.isPlayersNameVisible}
                units={group.units}
              />
            ));
          })}

        {missionEntity.groups
          .filter((group) => group.side === 'East')
          .map((group, index) => {
            return group.units.slice(0, 1).map((unit) => (
              <UnitMarker
                key={unit.id}
                data={{
                  ...unit,
                  description: callsigns[index],
                }}
                isAllVisible={markersEntity.isPlayersNameVisible}
                units={group.units}
              />
            ));
          })}

        {missionEntity.groups
          .filter((group) => group.side === 'Independent')
          .map((group, index) => {
            return group.units.slice(0, 1).map((unit) => (
              <UnitMarker
                key={unit.id}
                data={{
                  ...unit,
                  description: callsigns[index],
                }}
                isAllVisible={markersEntity.isPlayersNameVisible}
                units={group.units}
              />
            ));
          })}
      </View.Condition>

      <View.Condition if={Boolean(missionEntity.fileName)}>
        {missionEntity.markers
          .filter((marker) =>
            Boolean(MarkerType[marker.type as keyof typeof MarkerType])
          )
          .map((marker) => (
            <ArmaMarker
              key={marker.id}
              type={getMissionMarkerType(marker)}
              size={[marker.width, marker.height]}
              icon={MarkerIcon(marker.type, marker.colorName, marker.width)}
              direction={marker.position.angle}
              x={marker.position.coordinates.x}
              y={marker.position.coordinates.y}
              draggable={false}
              color={String(
                MarkerColor[marker.colorName as keyof typeof MarkerColor]
              )}
            />
          ))}
      </View.Condition>

      <View.Condition if={Boolean(missionEntity.fileName)}>
        {missionEntity.vehicles.map((vehicle) => (
          <VehicleMarker key={vehicle.id} data={vehicle} />
        ))}
      </View.Condition>

      {markersEntity.swtMarkers.map((marker) => {
        return (
          <ArmaMarker
            key={marker.id}
            type={getMarkerType(marker)}
            size={getMarkerSize(marker)}
            icon={MarkerIcon(
              getMarkerType(marker),
              getMarkerColorName(marker),
              getMarkerSize(marker)
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
