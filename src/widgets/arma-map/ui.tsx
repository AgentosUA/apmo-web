'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(() => import('@/shared/ui/atoms/basic-map/ui'), {
  ssr: false,
});

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerTypeID, markersEntity } from '@/entities/markers';
import { observer } from 'mobx-react-lite';

import { ArmaMarker, MarkerIcon } from '@/shared/ui/atoms/marker';
import { useMounted } from '@/shared/ui/hooks';
import { markerColorNames, markerNames } from '@/shared/data/marker';

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
      mapSize={Number(mapsEntity.selectedMap.width) ?? 0}>
      {markersEntity.swtMarkers.map((marker, index) => {
        return (
          <ArmaMarker
            key={marker.id}
            icon={MarkerIcon(
              markerNames[marker.data[SWTMarkerTypeID.type]],
              markerColorNames[marker.data[SWTMarkerTypeID.color]]
            )}
            x={marker.data[SWTMarkerTypeID.coordinates][0]}
            y={marker.data[SWTMarkerTypeID.coordinates][1]}
            onUpdatePosition={(x, y) => markersEntity.updateMarker(index, x, y)}
            color={markerColorNames[marker.data[SWTMarkerTypeID.color]]}
            draggable>
            {marker.data[SWTMarkerTypeID.text]}
          </ArmaMarker>
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
