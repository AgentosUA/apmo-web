'use client';

import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';

import { CreateMarkerModel, createMarkerEntity } from './model';
import { MarkerColor, markerColorNames } from '@/shared/data/marker';
import classNames from 'classnames';

import markerStyles from '@/shared/ui/atoms/marker/ui.module.scss';
import styles from './ui.module.scss';

const CreateMarker: FC<{
  model?: CreateMarkerModel;
}> = observer(({ model }) => {
  const entity = model ?? createMarkerEntity;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        entity.close();
      }
    };

    if (entity.isVisible) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [entity, entity.isVisible]);

  if (!entity.isVisible) return null;

  console.log(`${styles[markerColorNames[MarkerColor.ColorBlue]]}Background`);

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper} draggable>
        <div className={styles.quickMarkerSelection}>{/*  */}</div>
        <div className={styles.colorSelection}>
          {[
            MarkerColor.ColorBlue,
            MarkerColor.ColorRed,
            MarkerColor.ColorGreen,
            MarkerColor.ColorBlack,
            MarkerColor.ColorWhite,
            MarkerColor.ColorYellow,
          ].map((color) => (
            <div
              key={color}
              className={classNames(
                styles.color,
                `${styles[markerColorNames[color]]}Background`
              )}
            />
          ))}
        </div>
        <div className={styles.channel}>Side Channel</div>
        <input autoFocus className={styles.input} placeholder='' alt='input' />
      </div>
    </div>
  );
});

export { CreateMarker };
