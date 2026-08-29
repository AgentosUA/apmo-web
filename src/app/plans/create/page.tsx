'use client';

import dynamic from 'next/dynamic';

import { observer } from 'mobx-react-lite';

import { MapSelection } from '@/widgets/map-selection';

import { mapsEntity } from '@/entities/maps';

import { MapOverlay } from '@/widgets/map-overlay';

const ArmaMap = dynamic(
  () => import('@/widgets/arma-map/ui').then((m) => m.ArmaMap),
  {
    ssr: false,
  }
);

const CreateMissionPage = observer(() => {
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
