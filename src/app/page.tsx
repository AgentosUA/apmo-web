'use client';

import Image from 'next/image';

import Link from 'next/link';
import styles from './page.module.scss';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useRef } from 'react';
import { missionEntity } from '@/entities/mission';
import { mapsEntity } from '@/entities/maps';
import { mapList } from '@/shared/data/map-list';
import { useRouter } from 'next/navigation';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

const HomePage = observer(() => {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const onMissionUpload = (e: ChangeEvent<HTMLInputElement>) => {
    missionEntity.loadMission(e.target.files?.[0]);
  };

  useEffect(() => {
    if (!missionEntity.island) return;
    const island = mapList.find(
      (map) => map.dir === missionEntity.island.toLowerCase()
    );

    if (!island) {
      toasterEntity.call({
        title: 'Current map is not supported',
        description: 'Check for changelog',
      });

      return;
    }

    mapsEntity.selectMap(island);
    router.push('/plans/create');
  }, [missionEntity.island]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.menu}></div>
        <div className={styles.logo}>
          <Image
            className={styles.logoImage}
            src='/a3-logo.png'
            width={159}
            height={91}
            alt='logo'
          />
          <h1 className={styles.title}>PLAN MAKER ONLINE</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.navigation}>
          <Link href='/plans/create' className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/select-map.png'
              width={325}
              height={325}
              alt='Select map'
            />
            <p className={styles.navigationItemText}>Select Map</p>
          </Link>
          <div
            className={styles.navigationItem}
            onClick={() => {
              inputRef?.current?.click();
            }}>
            <Image
              className={styles.navigationItemImage}
              src='/load-mission.png'
              width={325}
              height={325}
              alt='Load mission'
            />
            <input
              ref={inputRef}
              onChange={onMissionUpload}
              className={styles.hidden}
              multiple={false}
              type='file'
              accept='.pbo'
            />
            <p className={styles.navigationItemText}>Load mission</p>
          </div>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/changelog.png'
              width={325}
              height={325}
              alt='Changelog'
            />
            <p className={styles.navigationItemText}>Changelog</p>
          </div>
        </div>
      </main>
    </>
  );
});

export default HomePage;
