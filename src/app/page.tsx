'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, ReactNode, useEffect, useRef } from 'react';
import { FiChevronRight, FiMap, FiRefreshCw, FiUpload } from 'react-icons/fi';

import { mapsEntity } from '@/entities/maps';
import { missionEntity } from '@/entities/mission';
import { i18n } from '@/shared/lib/i18n/config';
import { getWorldDisplayName } from '@/shared/lib/ocap/worlds';
import { ScreenLoader } from '@/shared/ui/moleculas/screen-loader';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header/ui';

const NAV_ITEM_CLASS =
  'group relative flex justify-center items-center w-[325px] h-[325px] cursor-pointer overflow-hidden border-2 border-black border-r-0 bg-[rgba(7,11,10,0.5)] transition-all duration-300 last:border-r-2';

const NAV_IMAGE_CLASS =
  'absolute top-0 left-0 z-0 transition-[top] duration-300 w-full h-full object-cover group-hover:top-[-325px]';

const NAV_ITEMS = [
  {
    id: 'select-map',
    href: '/plans/create',
    image: '/select-map.png',
    titleKey: 'pages:home:selectMap',
    Icon: FiMap,
  },
  {
    id: 'load-mission',
    image: '/load-mission.png',
    titleKey: 'pages:home:loadMission',
    Icon: FiUpload,
  },
  {
    id: 'changelog',
    href: '/changelog',
    image: '/changelog.png',
    titleKey: 'pages:home:changelog',
    Icon: FiRefreshCw,
  },
] as const;

/** Renders a Link for items with href, otherwise a button. */
const NavAction = ({
  href,
  onClick,
  className,
  children,
}: {
  href?: string;
  onClick?: () => void;
  className: string;
  children: ReactNode;
}) =>
  href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );

const MOBILE_CARD_CLASS =
  'group relative flex items-center gap-4 w-full h-24 px-4 overflow-hidden text-left border border-white/15 bg-a3-panel transition-colors duration-200 active:border-a3-orange active:bg-a3-orange/20 focus-visible:outline-none focus-visible:border-white';

const HomePage = observer(() => {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const onMissionUpload = (e: ChangeEvent<HTMLInputElement>) => {
    missionEntity.loadMission(e.target.files?.[0]);
    // Reset so picking the same file again still fires onChange.
    e.target.value = '';
  };

  // Covers both steps: parsing the .pbo and loading its map before redirecting.
  const isMissionMapLoading = Boolean(missionEntity.data?.island) && mapsEntity.isMapLoading;

  useEffect(() => {
    const island = missionEntity.data?.island;
    if (!island) return;

    mapsEntity.selectMap(island).then((isAvailable) => {
      if (!isAvailable) {
        toasterEntity.call({
          title: i18n.t('toasters:mapNotAvailable'),
          description: i18n.t('toasters:mapNotInOcapDatabase', {
            map: getWorldDisplayName(island),
          }),
        });

        return;
      }

      router.replace('/plans/create');
    });
  }, [missionEntity.data?.island]);

  const onLoadMissionClick = () => inputRef.current?.click();

  return (
    <div className="flex flex-col h-full min-h-screen min-h-svh">
      <Header />

      <ScreenLoader
        isLoading={missionEntity.isLoading || isMissionMapLoading}
        label={
          <Localize
            translationKey={
              missionEntity.isLoading ? 'pages:home:loadingMission' : 'pages:home:loadingMap'
            }
          />
        }
      />

      <input
        ref={inputRef}
        onChange={onMissionUpload}
        className="hidden"
        multiple={false}
        type="file"
        accept=".pbo"
      />

      {/* Desktop: Arma 3 main-menu style tiles on a full-width band */}
      <main className="pt-[30px] mt-[133px] w-full tablet:hidden">
        <div className="relative w-full border-y border-white/10 bg-[linear-gradient(to_right,rgba(7,11,10,0)_0%,rgba(7,11,10,0.55)_10%,rgba(7,11,10,0.55)_90%,rgba(7,11,10,0)_100%)] shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <div className="relative flex justify-center items-center min-h-[325px] w-fit mx-auto bg-a3-panel">
            {NAV_ITEMS.map((item) => (
              <NavAction
                key={item.id}
                href={'href' in item ? item.href : undefined}
                onClick={onLoadMissionClick}
                className={NAV_ITEM_CLASS}
              >
                <Image
                  className={NAV_IMAGE_CLASS}
                  src={item.image}
                  width={325}
                  height={325}
                  alt=""
                />
                <p className="text-[22px] text-center text-white z-[1] uppercase font-medium">
                  <Localize translationKey={item.titleKey} />
                </p>
              </NavAction>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile / tablet: stacked full-width action cards */}
      <main className="hidden tablet:flex flex-1 flex-col justify-center gap-3 w-full max-w-[560px] mx-auto px-4 py-8">
        {NAV_ITEMS.map(({ id, image, titleKey, Icon, ...rest }) => (
          <NavAction
            key={id}
            href={'href' in rest ? rest.href : undefined}
            onClick={onLoadMissionClick}
            className={MOBILE_CARD_CLASS}
          >
            <Image
              className="absolute inset-y-0 right-0 z-0 w-3/5 h-full object-cover"
              src={image}
              width={325}
              height={325}
              alt=""
            />
            <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(7,11,10,0.95)_35%,rgba(7,11,10,0.55)_75%,rgba(7,11,10,0.35)_100%)]" />
            <div className="absolute left-0 inset-y-0 z-[2] w-1 bg-a3-orange opacity-0 transition-opacity group-active:opacity-100" />

            <span className="relative z-[2] flex items-center justify-center w-11 h-11 shrink-0 border border-white/25 bg-black/40 text-white text-xl">
              <Icon aria-hidden />
            </span>
            <span className="relative z-[2] flex-1 text-lg uppercase font-medium text-white leading-tight">
              <Localize translationKey={titleKey} />
            </span>
            <FiChevronRight
              aria-hidden
              className="relative z-[2] shrink-0 text-2xl text-white/70"
            />
          </NavAction>
        ))}
      </main>

      <Footer />
    </div>
  );
});

export default HomePage;
