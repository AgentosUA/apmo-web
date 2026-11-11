'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useMemo, useState } from 'react';

import { mapsEntity } from '@/entities/maps';
import { i18n } from '@/shared/lib/i18n/config';
import { getMapSource } from '@/shared/lib/ocap/worlds';
import { Button } from '@/shared/ui/atoms/button';
import { WorldPreview } from '@/shared/ui/atoms/world-preview/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

/**
 * World selector. Worlds come from the OCAP map database (see
 * `shared/lib/ocap/worlds.ts`); the map configuration and tiles are loaded
 * when a world is confirmed.
 */
const MapSelection: FC<{
  backUrl?: string;
  continueUrl?: string;
}> = observer(({ backUrl = '/', continueUrl }) => {
  const router = useRouter();
  const worlds = mapsEntity.worlds;
  const [selectedId, setSelectedId] = useState(mapsEntity.defaultMap);
  const [query, setQuery] = useState('');

  const filteredWorlds = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return worlds;
    return worlds.filter(
      (world) =>
        world.displayName.toLowerCase().includes(search) || world.name.includes(search)
    );
  }, [worlds, query]);

  const selected =
    filteredWorlds.find((world) => world.name === selectedId) ??
    filteredWorlds[0] ??
    worlds.find((world) => world.name === selectedId);

  useEffect(() => {
    void mapsEntity.loadWorlds();
  }, []);

  useEffect(() => {
    if (!worlds.length) return;
    document.getElementById(`world-${selectedId}`)?.scrollIntoView({ behavior: 'instant', block: 'center' });
    // Only on first render of the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worlds.length]);

  const onContinue = async () => {
    if (!selected) return;

    const isAvailable = await mapsEntity.selectMap(selected.name);

    if (!isAvailable) {
      toasterEntity.call({
        title: i18n.t('toasters:mapNotAvailable'),
        description: i18n.t('toasters:mapNotInOcapDatabase', { map: selected.displayName }),
      });
      return;
    }

    if (continueUrl) router.push(continueUrl);
  };

  return (
    <section className="tablet:h-screen tablet:h-svh tablet:w-full">
      <div className="mx-auto flex items-center flex-col w-full max-w-[650px] h-[465px] overflow-hidden tablet:my-auto tablet:h-auto tablet:max-h-none tablet:max-w-none">
        <h1 className="w-full h-5 pt-0.5 pl-1.5 text-white bg-a3-orange font-normal text-sm uppercase flex items-center">
          <Localize translationKey="pages:home:selectMap" />
        </h1>
        <div className="flex items-center justify-between text-left w-full h-full bg-black/60 tablet:flex-col-reverse">
          <div className="mb-auto w-[268px] overflow-y-auto overflow-x-hidden h-full max-h-[445px] bg-black tablet:w-full tablet:h-full tablet:max-h-none">
            <div className="sticky top-0 z-[1] bg-black p-1">
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selected) void onContinue();
                }}
                placeholder={i18n.t('pages:home:searchMap')}
                className="w-full h-[26px] px-1.5 text-sm text-white bg-a3-surface border border-white/20 placeholder:text-white/40 focus:outline-hidden focus:border-white/60"
              />
            </div>
            {mapsEntity.isWorldsLoading && !worlds.length && (
              <p className="pl-1.5 text-sm text-white/60">
                <Localize translationKey="common:loading" />…
              </p>
            )}
            {!mapsEntity.isWorldsLoading && worlds.length > 0 && !filteredWorlds.length && (
              <p className="pl-1.5 text-sm text-white/60">
                <Localize translationKey="pages:home:noMapsFound" />
              </p>
            )}
            {filteredWorlds.map((item) => (
              <div
                id={`world-${item.name}`}
                key={item.name}
                className={cn(
                  'w-full h-[22px] flex items-center pl-1.5 text-white cursor-pointer tablet:h-[35px]',
                  selected?.name === item.name && 'text-black animate-white-blink',
                  'hover:text-black hover:animate-white-blink'
                )}
                onClick={() => setSelectedId(item.name)}
                onDoubleClick={() => {
                  setSelectedId(item.name);
                  void onContinue();
                }}
              >
                <p className="text-sm font-light cursor-pointer truncate">{item.displayName}</p>
                <span className="ml-auto pl-2 pr-1.5 shrink-0 text-[10px] uppercase opacity-60">
                  {item.sources?.map((id) => getMapSource(id)?.label ?? id).join(' · ')}
                </span>
              </div>
            ))}
          </div>
          <div className="ml-0.5 mb-auto flex flex-col justify-center text-left bg-black h-full w-[380px] tablet:hidden tablet:justify-start tablet:h-auto tablet:w-full">
            <h2 className="mt-1 pl-1.5 text-white font-normal uppercase">{selected?.displayName}</h2>
            <WorldPreview
              key={selected?.name}
              worldName={selected?.name}
              className="h-full w-full object-cover tablet:h-[115px] tablet:w-full tablet:object-cover"
              width={380}
              height={405}
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
        <Button onClick={onContinue} disabled={mapsEntity.isMapLoading || !selected}>
          {mapsEntity.isMapLoading ? (
            <Localize translationKey="common:loading" />
          ) : (
            <Localize translationKey="common:continue" />
          )}
        </Button>
      </div>
    </section>
  );
});

export { MapSelection };
