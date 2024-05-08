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
import Image from 'next/image';
import { Button } from '@/shared/ui/atoms/button';
import Link from 'next/link';

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
  };

  useEffect(() => {
    getPlan();
    setIsLoading(false);
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
          <Link href='/'>
            <Button>Go to main</Button>
          </Link>
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
