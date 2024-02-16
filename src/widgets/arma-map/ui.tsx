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
      minZoom={1}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width) ?? 0}>
      {markersEntity.swtMarkers.map((marker, index) => {
        return (
          <ArmaMarker
            key={marker[SWTMarkerTypeID.coordinates][0]}
            icon={MarkerIcon(
              markerNames[marker[SWTMarkerTypeID.type]],
              markerColorNames[marker[SWTMarkerTypeID.color]]
            )}
            x={marker[SWTMarkerTypeID.coordinates][0]}
            y={marker[SWTMarkerTypeID.coordinates][1]}
            onUpdatePosition={(x, y) => markersEntity.updateMarker(index, x, y)}
            color={markerColorNames[marker[SWTMarkerTypeID.color]]}
            draggable>
            {marker[SWTMarkerTypeID.text]}
          </ArmaMarker>
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
