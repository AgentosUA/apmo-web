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

import styles from './page.module.scss';

const CreateMissionPage = observer(() => {
  if (!mapsEntity.selectedMap) {
    return (
      <main className={styles.main}>
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
