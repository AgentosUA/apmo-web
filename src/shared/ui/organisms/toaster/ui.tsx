'use client';

import { FC } from 'react';

import { Toaster as ToasterType, toasterEntity } from './model';

import { observer } from 'mobx-react-lite';

import styles from './ui.module.scss';

const Toaster: FC<{
  model?: ToasterType;
}> = observer(({ model }) => {
  const entity = model ?? toasterEntity;

  return (
    <>
      {entity.toasters.map((toaster, index) => (
        <div
          key={toaster.id}
          className={styles.wrapper}
          style={{
            zIndex: 1000 + index,
          }}>
          <div className={styles.title}>{toaster.title}</div>
          <div className={styles.content}>
            <div className={styles.iconBox}>{toaster.type}</div>
            <div className={styles.description}>{toaster.description}</div>
          </div>
        </div>
      ))}
    </>
  );
});

export { Toaster };
