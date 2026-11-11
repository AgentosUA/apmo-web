'use client';

import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

import { mapsEntity } from '@/entities/maps';
import { planEntity } from '@/entities/plan';
import { MapOverlay } from '@/widgets/map-overlay';
import { MapSelection } from '@/widgets/map-selection';

const ArmaMap = dynamic(() => import('@/widgets/arma-map/ui').then((m) => m.ArmaMap), {
  ssr: false,
});

const CreateMissionPage = observer(() => {
  // A new plan: nothing is synced until it is saved from the header.
  useEffect(() => {
    planEntity.reset();
  }, []);

  if (!mapsEntity.selectedMap) {
    return (
      <main className="m-0 p-0 w-full h-full flex flex-col justify-center items-center min-h-screen min-h-svh">
        <MapSelection />
      </main>
    );
  }

  return (
    <>
      <ArmaMap />
      <MapOverlay />
    </>
  );
});

export default CreateMissionPage;
