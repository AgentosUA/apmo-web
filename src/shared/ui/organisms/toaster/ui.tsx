'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC } from 'react';

import { Toaster as ToasterType, toasterEntity } from './model';
import styles from './ui.module.scss';


const Toaster: FC<{
  model?: ToasterType;
}> = observer(({ model }) => {
  const entity = model ?? toasterEntity;

  return (
    <div className={styles.wrapper}>
      {entity.toasters.map((toaster, index) => (
        <div
          key={toaster.id}
          className={styles.toaster}
          data-duration={toaster.timer}
          style={{
            zIndex: 1000 + index,
          }}>
          <div className={styles.title} data-duration={toaster.timer}>
            {toaster.title}
          </div>
          <div className={styles.content} data-duration={toaster.timer}>
            <div className={styles.iconBox}>
              <Image
                src='/icons/radio.png'
                width={32}
                height={32}
                alt='radio'
              />
            </div>
            <div className={styles.description}>{toaster.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

export { Toaster };
