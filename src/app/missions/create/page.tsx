'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/atoms/button';
import styles from './page.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';

export default function CreateMission() {
  const maps = [
    {
      id: 0,
      name: 'Chernarus Autumn',
      image: '/maps/chernarus-autumn.jpg',
      author: 'Bohemia Interactive',
    },
  ];

  const [selectedMap, onSelectMap] = useState(maps[0]);

  return (
    <main className={styles.main}>
      <section className={styles.selection}>
        <h1 className={styles.title}>Select Map</h1>
        <div className={styles.selectAndPreview}>
          <div className={styles.list}>
            {maps.map((item) => (
              <div
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
              width={380}
              height={380}
              src={selectedMap.image}
              alt='map preview'
            />
          </div>
        </div>
      </section>
      <div className={styles.actions}>
        <Link href='/'>
          <Button>Back</Button>
        </Link>
        <Button>Continue</Button>
      </div>
    </main>
  );
}
