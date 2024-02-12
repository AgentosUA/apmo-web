'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(() => import('@/shared/ui/atoms/basic-map/ui'), {
  ssr: false,
});

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerTypeID, markersEntity } from '@/entities/markers';
import { observer } from 'mobx-react-lite';

import { ArmaMarker, MarkerIcons } from '@/shared/ui/atoms/marker';
import { useMounted } from '@/shared/ui/hooks';

const ArmaMap = observer(() => {
  const isMounted = useMounted();
  if (
    !isMounted ||
    !mapsEntity.selectedMap ||
    !Number(mapsEntity.selectedMap?.width_o)
  )
    return null;

  return (
    <BasicMap
      name={mapsEntity.selectedMap.dir}
      minZoom={1}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width_o) ?? 0}>
      {markersEntity.swtMarkers.map((marker, index) => {
        return (
          <ArmaMarker
            key={marker[SWTMarkerTypeID.coordinates][0]}
            icon={MarkerIcons[marker[SWTMarkerTypeID.type]]}
            x={marker[SWTMarkerTypeID.coordinates][0]}
            y={marker[SWTMarkerTypeID.coordinates][1]}
            onUpdatePosition={(x, y) => markersEntity.updateMarker(index, x, y)}
            draggable
          />
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
