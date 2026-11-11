'use client';

import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { missionEntity } from '@/entities/mission';
import { planEntity, planSession } from '@/entities/plan';
import { userEntity } from '@/entities/user/model';
import { Button } from '@/shared/ui/atoms/button';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { MapOverlay } from '@/widgets/map-overlay';

const ArmaMap = dynamic(() => import('@/widgets/arma-map/ui').then((m) => m.ArmaMap), {
  ssr: false,
});

const Message = ({ children }: { children: ReactNode }) => (
  <div className="relative w-full h-full min-w-[100vw] min-h-screen min-h-svh min-w-[100svw] flex justify-center items-center">
    <div className="flex justify-center items-center gap-5 h-[350px] w-full text-[22px] text-center text-white flex-col bg-a3-surface">
      {children}
    </div>
  </div>
);

const Page = observer(() => {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const planId = params.id as string;

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      await planEntity.loadPlan(planId);

      if (isCancelled) return;

      setIsLoading(false);

      // Every change from now on is synced and saved through the socket.
      if (!planEntity.loadError) {
        planSession.connect(planId);
      }
    };

    load();

    return () => {
      isCancelled = true;
      planSession.disconnect();
      planEntity.reset();
    };
  }, [planId]);

  const onOverlayBackClick = () => {
    planSession.disconnect();
    missionEntity.resetMission();
    mapsEntity.unselectMap();
    markersEntity.clearMarkers();
    planEntity.reset();

    router.push('/plans/create');
  };

  if (isLoading) {
    return (
      <Message>
        <p>
          <Localize translationKey="common:loading" />
          ...
        </p>
      </Message>
    );
  }

  if (planEntity.loadError === 'forbidden') {
    return (
      <Message>
        <p>
          <Localize translationKey="pages:plans:noAccess" />
        </p>
        {!userEntity.isAuthorized && (
          <Link href="/auth/login">
            <Button variant="orange">
              <Localize translationKey="pages:plans:logInForAccess" />
            </Button>
          </Link>
        )}
      </Message>
    );
  }

  if (planEntity.loadError || !mapsEntity.selectedMap) {
    return (
      <Message>
        <p>
          <Localize translationKey="pages:plans:planNotFound" />
        </p>
      </Message>
    );
  }

  return (
    <>
      <ArmaMap />
      <MapOverlay onBackClick={onOverlayBackClick} />
    </>
  );
});

export default Page;
