'use client';

import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';

import { CreateMarkerModel, createMarkerEntity } from './model';
import { markerColorNames, markerNames } from '@/shared/data/marker';
import classNames from 'classnames';

import styles from './ui.module.scss';
import { MarkerIconComponent } from '@/shared/ui/atoms/marker';
import { useMap } from 'react-leaflet';
import {
  MarkersModel,
  SWTMarkerID,
  markersEntity as sharedMarkersEntity,
} from '@/entities/markers';

const CreateMarker: FC<{
  model?: CreateMarkerModel;
  markersModel?: MarkersModel;
}> = observer(({ model, markersModel }) => {
  const entity = model ?? createMarkerEntity;
  const markersEntity = markersModel ?? sharedMarkersEntity;

  const map = useMap();

  useEffect(() => {
    const onEscapePress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        entity.close();
      }
    };

    const onEnterPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        markersEntity.addMarker({
          ...entity.marker,
        });

        entity.resetMarker();
        entity.close();
      }
    };

    if (entity.isVisible) {
      window.addEventListener('keydown', onEscapePress);
      window.addEventListener('keydown', onEnterPress);
      map.dragging.disable();
    }

    return () => {
      window.removeEventListener('keydown', onEscapePress);
      window.removeEventListener('keydown', onEnterPress);
      map.dragging.enable();
    };
  }, [entity.isVisible]);

  if (!entity.isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <MarkerIconComponent
            width={39}
            height={39}
            className={styles.selectedMarker}
            markerName={markerNames[entity.marker.data[SWTMarkerID.type]]}
            color={markerColorNames[entity.marker.data[SWTMarkerID.color]]}
          />

          <div className={styles.quickMarkerSelection}>
            {entity.defaultSWTMarkers.map((markerType) => (
              <MarkerIconComponent
                key={markerType}
                width={39}
                height={39}
                onClick={() => entity.setMarkerType(markerType)}
                className={styles.marker}
                markerName={markerNames[markerType]}
                color={markerColorNames[entity.marker.data[SWTMarkerID.color]]}
              />
            ))}
          </div>

          <div className={styles.colorSelection}>
            {entity.defaultSWTColors.map((markerColor) => (
              <div
                key={markerColor}
                onClick={() => entity.setMarkerColor(markerColor)}
                className={classNames(
                  styles.color,
                  styles[`${markerColorNames[markerColor]}Background`]
                )}
              />
            ))}
          </div>

          <div className={styles.channel}>Side Channel</div>

          <input
            autoFocus
            className={styles.input}
            value={entity.marker.data[SWTMarkerID.text]}
            onChange={(e) => entity.setMarkerText(e.target.value)}
            placeholder=''
            alt='input'
          />
        </div>
      </div>
    </div>
  );
});

export { CreateMarker };
