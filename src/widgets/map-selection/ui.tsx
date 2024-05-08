/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { FC, useEffect, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import classNames from 'classnames';

import { observer } from 'mobx-react-lite';

import { Button } from '@/shared/ui/atoms/button';

import { mapsEntity } from '@/entities/maps';

import styles from './ui.module.scss';

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
    <section className={styles.wrapper}>
      <div className={styles.selection}>
        <h1 className={styles.title}>Select Map</h1>
        <div className={styles.selectAndPreview}>
          <div className={styles.list}>
            {mapList.map((item) => (
              <div
                id={item.id}
                key={item.id}
                className={classNames(styles.listItem, {
                  [styles.listItemActive]: selectedMap.id === item.id,
                })}
                onClick={() => onSelectMap(item)}>
                {/* image */}

                <p className={styles.listItemText}>{item.name}</p>
              </div>
            ))}
          </div>
          <div className={styles.mapPreview}>
            <h2 className={styles.mapTitle}>{selectedMap.name}</h2>
            <p className={styles.author}>by {selectedMap.author}</p>
            <Image
              className={styles.mapImage}
              priority
              width={380}
              height={404.75}
              src={selectedMap.image ?? ''}
              alt='map preview'
            />
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Link href={backUrl}>
          <Button>Back</Button>
        </Link>
        {!continueUrl && (
          <Button onClick={() => mapsEntity.selectMap(selectedMap)}>
            Continue
          </Button>
        )}
        {continueUrl && (
          <Link href={continueUrl}>
            <Button>Continue</Button>
          </Link>
        )}
      </div>
    </section>
  );
});

export { MapSelection };
