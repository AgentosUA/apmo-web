'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { mapsEntity } from '@/entities/maps';
import { missionEntity } from '@/entities/mission';
import { mapList } from '@/shared/data/map-list';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header/ui';

import styles from './page.module.scss';

const HomePage = observer(() => {
  const { t } = useTranslation();
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
    // TODO: search for a way to redirect with next/router
    router.replace('/plans/create');
  }, [missionEntity.data?.island]);

  return (
    <div className={styles.wrapper}>
      <Header />
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
            <p className={styles.navigationItemText}>
              {t('pages:home:selectMap')}
            </p>
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
          <Link href='/changelog' className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/changelog.png'
              width={325}
              height={325}
              alt='Changelog'
            />
            <p className={styles.navigationItemText}>Changelog</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default HomePage;
