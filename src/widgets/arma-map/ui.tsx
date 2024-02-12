'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(() => import('@/shared/ui/atoms/basic-map/ui'), {
  ssr: false,
});

import { mapsEntity } from '@/entities/maps';
import { SWTMarkerTypeID, markersEntity } from '@/entities/markers';
import { observer } from 'mobx-react-lite';

import { Marker } from 'react-leaflet';
import { MarkerIcons } from '@/shared/ui/atoms/marker';
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
      minZoom={0}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width_o) ?? 0}>
      {markersEntity.swtMarkers.map((marker) => {
        return (
          <Marker
            key={marker[SWTMarkerTypeID.coordinates][0]}
            draggable
            icon={MarkerIcons[marker[SWTMarkerTypeID.type]]}
            position={[
              marker[SWTMarkerTypeID.coordinates][1],
              marker[SWTMarkerTypeID.coordinates][0],
            ]}
          />
        );
      })}
    </BasicMap>
  );
});

export { ArmaMap };
