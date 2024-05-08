'use client';

import { mapsEntity } from '@/entities/maps';

import { planEntity } from '@/entities/plan';

import { MapOverlay } from '@/widgets/map-overlay';

import { observer } from 'mobx-react-lite';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

const ArmaMap = dynamic(
  () => import('@/widgets/arma-map/ui').then((m) => m.ArmaMap),
  {
    ssr: false,
  }
);

const Page = observer(() => {
  const params = useParams();

  useEffect(() => {
    planEntity.loadPlan(params.id as string);
  }, []);

  if (!mapsEntity.selectedMap) return null;

  const onOverlayBackClick = () => {};

  return (
    <>
      <ArmaMap />
      <MapOverlay isPlan onBackClick={onOverlayBackClick} />
    </>
  );
});

export default Page;
