'use client';

import dynamic from 'next/dynamic';
const BasicMap = dynamic(() => import('@/shared/ui/atoms/basic-map/ui'), {
  ssr: false,
});

import { mapsEntity } from '@/entities/maps';
import { observer } from 'mobx-react-lite';

const ArmaMap = observer(() => {
  if (!mapsEntity.selectedMap || !Number(mapsEntity.selectedMap?.width_o))
    return null;

  return (
    <BasicMap
      name={mapsEntity.selectedMap.dir}
      minZoom={0}
      maxZoom={Number(mapsEntity.selectedMap.zoom)}
      mapSize={Number(mapsEntity.selectedMap.width_o) ?? 0}
    />
  );
});

export { ArmaMap };
