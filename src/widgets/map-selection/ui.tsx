import { FC, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import classNames from 'classnames';

import { Button } from '@/shared/ui/atoms/button';

import { maps as defaultMaps } from './data';

import styles from './ui.module.scss';

const MapSelection: FC<{
  maps?: typeof defaultMaps;
  backUrl?: string;
  continueUrl?: string;
}> = ({ backUrl = '/', continueUrl = '/', maps = defaultMaps }) => {
  const [selectedMap, onSelectMap] = useState(maps[0]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.selection}>
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
              height={404.75}
              src={selectedMap.image}
              alt='map preview'
            />
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Link href={backUrl}>
          <Button>Back</Button>
        </Link>
        <Link href={continueUrl}>
          <Button>Continue</Button>
        </Link>
      </div>
    </section>
  );
};

export { MapSelection };
