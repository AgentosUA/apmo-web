'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef } from 'react';

import { mapsEntity } from '@/entities/maps';
import { missionEntity } from '@/entities/mission';
import { mapList } from '@/shared/data/map-list';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header/ui';

const NAV_ITEM_CLASS =
  'group relative flex justify-center items-center w-[325px] h-[325px] cursor-pointer overflow-hidden border-2 border-black border-r-0 bg-[rgba(7,11,10,0.5)] transition-all duration-300 last:border-r-2 tablet:w-full tablet:min-w-[100svw] tablet:h-auto tablet:min-h-[150px] tablet:border-r-0 tablet:border-l-0 tablet:border-b-0 tablet:last:border-b-2 tablet:last:border-r-0';

const NAV_IMAGE_CLASS =
  'absolute top-0 left-0 z-0 transition-[top] duration-300 w-full h-full object-cover group-hover:top-[-325px] tablet:group-hover:top-0';

const HomePage = observer(() => {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const onMissionUpload = (e: ChangeEvent<HTMLInputElement>) => {
    missionEntity.loadMission(e.target.files?.[0]);
  };

  useEffect(() => {
    if (!missionEntity.data?.island) return;
    const island = mapList.find(
      (map) => map.id === missionEntity.data?.island.toLowerCase()
    );

    if (!island) {
      toasterEntity.call({
        title: 'Current map is not supported',
        description: 'Check for changelog',
      });

      return;
    }

    mapsEntity.selectMap(island);
    router.replace('/plans/create');
  }, [missionEntity.data?.island]);

  return (
    <div className="flex flex-col h-full min-h-screen min-h-svh">
      <Header />
      <main className="pt-[30px] mt-[133px] mx-auto tablet:mt-auto">
        <div className="relative flex justify-center items-center min-h-[325px] gap-0 w-full bg-a3-panel tablet:min-h-[115px] tablet:flex-col">
          <Link href="/plans/create" className={NAV_ITEM_CLASS}>
            <Image
              className={NAV_IMAGE_CLASS}
              src="/select-map.png"
              width={325}
              height={325}
              alt="Select map"
            />
            <p className="text-[22px] text-center text-white z-[1] uppercase font-medium">
              <Localize translationKey="pages:home:selectMap" />
            </p>
          </Link>
          <div
            className={NAV_ITEM_CLASS}
            onClick={() => {
              inputRef?.current?.click();
            }}
          >
            <Image
              className={NAV_IMAGE_CLASS}
              src="/load-mission.png"
              width={325}
              height={325}
              alt="Load mission"
            />
            <input
              ref={inputRef}
              onChange={onMissionUpload}
              className="hidden"
              multiple={false}
              type="file"
              accept=".pbo"
            />
            <p className="text-[22px] text-center text-white z-[1] uppercase font-medium">
              <Localize translationKey="pages:home:loadMission" />
            </p>
          </div>
          <Link href="/changelog" className={NAV_ITEM_CLASS}>
            <Image
              className={NAV_IMAGE_CLASS}
              src="/changelog.png"
              width={325}
              height={325}
              alt="Changelog"
            />
            <p className="text-[22px] text-center text-white z-[1] uppercase font-medium">
              <Localize translationKey="pages:home:changelog" />
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default HomePage;
