/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { FC, useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import { observer } from 'mobx-react-lite';

import { Button } from '@/shared/ui/atoms/button';

import { mapsEntity } from '@/entities/maps';

import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

const MapSelection: FC<{
  backUrl?: string;
  continueUrl?: string;
}> = observer(({ backUrl = '/', continueUrl }) => {
  const mapList = mapsEntity.getMaps();

  const [selectedMap, onSelectMap] = useState(mapsEntity.defaultMap);

  useEffect(() => {
    const element = document.getElementById(selectedMap.id);

    if (!element) return;

    element.scrollIntoView({ behavior: 'instant', block: 'center' });
  }, []);

  return (
    <section className="tablet:h-screen tablet:h-svh tablet:w-full">
      <div className="mx-auto flex items-center flex-col w-full max-w-[650px] h-[465px] overflow-hidden tablet:my-auto tablet:h-auto tablet:max-h-none tablet:max-w-none">
        <h1 className="w-full h-5 pt-0.5 pl-1.5 text-white bg-a3-orange font-normal text-sm uppercase flex items-center">
          <Localize translationKey="pages:home:selectMap" />
        </h1>
        <div className="flex items-center justify-between text-left w-full h-full bg-black/60 tablet:flex-col-reverse">
          <div className="mb-auto w-[268px] overflow-y-auto overflow-x-hidden h-full max-h-[445px] bg-black tablet:w-full tablet:h-full tablet:max-h-none">
            {mapList.map((item) => (
              <div
                id={item.id}
                key={item.id}
                className={cn(
                  'w-full h-[22px] flex items-center pl-1.5 text-white cursor-pointer tablet:h-[35px]',
                  selectedMap.id === item.id &&
                    'text-black animate-white-blink',
                  'hover:text-black hover:animate-white-blink'
                )}
                onClick={() => onSelectMap(item)}
              >
                <p className="text-sm font-light cursor-pointer">{item.name}</p>
              </div>
            ))}
          </div>
          <div className="ml-0.5 mb-auto flex flex-col justify-center text-left bg-black h-full tablet:hidden tablet:justify-start tablet:h-auto tablet:w-full">
            <h2 className="mt-1 pl-1.5 text-white font-normal uppercase">
              {selectedMap.name}
            </h2>
            <Image
              className="h-full object-cover tablet:h-[115px] tablet:w-full tablet:object-cover"
              priority
              width={380}
              height={404.75}
              src={selectedMap.image ?? ''}
              alt="map preview"
            />
          </div>
        </div>
      </div>
      <div className="mt-0.5 w-full flex justify-between items-center sticky bottom-0">
        <Link href={backUrl}>
          <Button>
            <Localize translationKey="common:back" />
          </Button>
        </Link>
        {!continueUrl && (
          <Button onClick={() => mapsEntity.selectMap(selectedMap)}>
            <Localize translationKey="common:continue" />
          </Button>
        )}
        {continueUrl && (
          <Link href={continueUrl}>
            <Button>
              <Localize translationKey="common:continue" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
});

export { MapSelection };
