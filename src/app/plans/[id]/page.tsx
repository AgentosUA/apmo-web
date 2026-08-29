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

import { Localize } from '@/shared/ui/quarks/localize/ui';

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

    return () => {
      planEntity.id = '';
      planEntity.title = '';
    };
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
      <div className="relative w-full h-full min-w-[100vw] min-h-screen min-h-svh min-w-[100svw] flex justify-center items-center">
        <div className="flex justify-center items-center h-[350px] w-full text-[22px] text-center text-white flex-col bg-a3-surface">
          <p>
            <Localize translationKey="common:loading" />
            ...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && !missionEntity?.data?.fileName) {
    return (
      <div className="relative w-full h-full min-w-[100vw] min-h-screen min-h-svh min-w-[100svw] flex justify-center items-center">
        <div className="flex justify-center items-center h-[350px] w-full text-[22px] text-center text-white flex-col bg-a3-surface">
          <p>
            <Localize translationKey="pages:plans:planNotFound" />
          </p>
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
