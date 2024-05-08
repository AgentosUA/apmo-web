'use client';

import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { missionEntity } from '@/entities/mission';
import { planEntity } from '@/entities/plan';

import { MapOverlay } from '@/widgets/map-overlay';

import { observer } from 'mobx-react-lite';

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './page.module.scss';

const ArmaMap = dynamic(
  () => import('@/widgets/arma-map/ui').then((m) => m.ArmaMap),
  {
    ssr: false,
  }
);

const Page = observer(() => {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const getPlan = async () => {
    await planEntity.loadPlan(params.id as string);
    setIsLoading(false);
  };

  useEffect(() => {
    getPlan();
  }, []);

  const onOverlayBackClick = () => {
    missionEntity.resetMission();
    mapsEntity.unselectMap();
    markersEntity.clearMarkers();
    planEntity.title = '';

    router.push('/plans/create');
  };

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>Loading...</div>
      </div>
    );
  }

  if (!isLoading && !missionEntity.fileName) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p>Plan not found</p>
        </div>
      </div>
    );
  }

  if (!mapsEntity.selectedMap) return null;

  return (
    <>
      <ArmaMap />
      <MapOverlay isPlan onBackClick={onOverlayBackClick} />
    </>
  );
});

export default Page;
