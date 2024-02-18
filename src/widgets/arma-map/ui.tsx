'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(() => import('@/shared/ui/atoms/basic-map/ui'), {
  ssr: false,
});

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerID, markersEntity } from '@/entities/markers';
import { observer } from 'mobx-react-lite';

import { ArmaMarker, MarkerIcon } from '@/shared/ui/atoms/marker';
import { useMounted } from '@/shared/ui/hooks';
import { markerColorNames, markerTypes } from '@/shared/data/marker';
import { CreateMarker } from '@/features/markers/create-marker/ui';
import { createMarkerEntity } from '@/features/markers/create-marker';

const ArmaMap = observer(() => {
  const isMounted = useMounted();
  if (
    !isMounted ||
    !mapsEntity.selectedMap ||
    !Number(mapsEntity.selectedMap?.width)
  )
    return null;

  return (
    <BasicMap
      name={mapsEntity.selectedMap.dir}
      minZoom={0}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width) ?? 0}
      dragging={!createMarkerEntity.isVisible}
      onDoubleClick={(event) => {
        createMarkerEntity.open();
        createMarkerEntity.setMarkerPosition(
          event.latlng.lng,
          event.latlng.lat
        );
      }}>
      <CreateMarker />

      {markersEntity.swtMarkers.map((marker) => {
        return (
          <ArmaMarker
            key={marker.id}
            icon={MarkerIcon(
              markerTypes[marker.data[SWTMarkerID.type]],
              markerColorNames[marker.data[SWTMarkerID.color]]
            )}
            x={marker.data[SWTMarkerID.coordinates][0]}
            y={marker.data[SWTMarkerID.coordinates][1]}
            onUpdatePosition={(x, y) =>
              markersEntity.updateMarker(marker.id, x, y)
            }
            onDelete={() => markersEntity.deleteMarker(marker.id)}
            color={markerColorNames[marker.data[SWTMarkerID.color]]}
            draggable>
            {marker.data[SWTMarkerID.text]}
          </ArmaMarker>
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
