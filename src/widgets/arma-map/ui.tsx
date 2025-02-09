'use client';

import { useMounted } from '@/shared/ui/hooks';

import { LeafletMouseEvent } from 'leaflet';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
const BasicMap = dynamic(
  () => import('@/shared/ui/atoms/basic-map/ui').then((m) => m.BasicMap),
  {
    ssr: false,
  }
);

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerID, markersEntity } from '@/entities/markers';
import {
  getMarkerColorName,
  getMarkerDirection,
  getMarkerSize,
  getMarkerText,
  getMarkerType,
} from '@/entities/markers/lib';
import { missionEntity } from '@/entities/mission';
import { callsigns } from '@/entities/mission/data';
import { getMissionMarkerType } from '@/entities/mission/lib';
import { createMarkerEntity } from '@/features/markers/create-marker';
import { CreateMarker } from '@/features/markers/create-marker/ui';
import { MarkerColorHEX } from '@/shared/data/marker';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import {
  ArmaMarker,
  LocationMarker,
  MarkerIcon,
  UnitMarker,
  VehicleMarker,
} from '@/shared/ui/atoms/marker';
import { View } from '@/shared/ui/quarks/view';

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
        {missionEntity.data?.groups.map((group) => {
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
        {missionEntity.data?.groups
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

        {missionEntity.data?.groups
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

        {missionEntity.data?.groups
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

      <View.Condition if={Boolean(missionEntity.data?.fileName)}>
        {missionEntity.data?.markers.map((marker) => (
          <ArmaMarker
            key={marker.id}
            type={getMissionMarkerType(marker)}
            size={[marker.width, marker.height]}
            icon={MarkerIcon(marker.type, marker.colorName, marker.width)}
            direction={marker.position.angle}
            x={marker.position.coordinates.x ?? 0}
            y={marker.position.coordinates.y ?? 0}
            draggable={false}
            color={String(
              MarkerColorHEX[marker.colorName as keyof typeof MarkerColorHEX]
            )}
          />
        ))}
      </View.Condition>

      <View.Condition if={Boolean(missionEntity.data?.fileName)}>
        {missionEntity.data?.vehicles.map((vehicle) => (
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
