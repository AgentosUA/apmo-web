'use client';

import { FC, PropsWithChildren, useEffect, memo, useRef } from 'react';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import { LeafletMouseEvent } from 'leaflet';

import classNames from 'classnames';

import { observer } from 'mobx-react-lite';

import { createArmaCRS } from './lib';

import styles from './ui.module.scss';

import { basicMapEntity } from './model';

const FlyComponent = observer<{
  maxZoom: number;
}>(({ maxZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!basicMapEntity.flyCoordinates.x && !basicMapEntity.flyCoordinates.y)
      return;

    map.flyTo(
      [basicMapEntity.flyCoordinates.x, basicMapEntity.flyCoordinates.y],
      maxZoom + 1
    );
  }, [basicMapEntity.flyCoordinates]);

  return null;
});

const MapHandlers: FC<{
  onDoubleClick?: (event: LeafletMouseEvent) => void;
  onZoomLevelChange?: (zoomLevel: number) => void;
}> = ({ onDoubleClick, onZoomLevelChange }) => {
  const map = useMap();

  useEffect(() => {
    map.addEventListener('dblclick', (event) => {
      onDoubleClick?.(event);
    });

    map.addEventListener('zoom', () => {
      onZoomLevelChange?.(map.getZoom());
    });

    return () => {
      map.removeEventListener('dblclick', onDoubleClick);
      map.removeEventListener('zoom', map.getZoom);
    };
  }, []);

  return null;
};

const BasicMap: FC<
  PropsWithChildren<{
    className?: string;
    name: string;
    mapSize?: number;
    defaultZoom?: number;
    minZoom: number;
    maxZoom: number;
    scale?: number;
    dragging?: boolean;
    merged?: boolean;
    onDoubleClick?: (event: LeafletMouseEvent) => void;
    onZoomLevelChange?: (zoomLevel: number) => void;
  }>
> = memo(
  ({
    className,
    children,
    mapSize = 0,
    name,
    minZoom = 0,
    maxZoom,
    defaultZoom = 2,
    dragging = true,
    onDoubleClick,
    onZoomLevelChange,
  }) => {
    const armaCRS = createArmaCRS(mapSize);

    const isRetina = 1 !== window.devicePixelRatio;

    return (
      <div id='map'>
        <MapContainer
          className={classNames(styles.map, className)}
          center={[mapSize / 1.9, mapSize / 2]}
          crs={armaCRS}
          zoomControl={false}
          zoom={defaultZoom}
          maxZoom={maxZoom}
          dragging={dragging}
          doubleClickZoom={false}
          maxBoundsViscosity={0.7}
          wheelPxPerZoomLevel={500}
          markerZoomAnimation>
          <MapHandlers
            onDoubleClick={onDoubleClick}
            onZoomLevelChange={onZoomLevelChange}
          />

          <FlyComponent maxZoom={maxZoom} />

          <TileLayer
            url={`${process.env.NEXT_PUBLIC_MAPS_URL}/${name}/{z}/{x}_{y}.png`}
            tileSize={256}
            keepBuffer={4}
            updateInterval={100}
            updateWhenZooming
            updateWhenIdle={false}
            minZoom={minZoom}
            maxZoom={maxZoom + 10}
            maxNativeZoom={isRetina ? maxZoom - 1 : maxZoom}
            noWrap
            detectRetina
          />

          {children}
        </MapContainer>
      </div>
    );
  }
);

BasicMap.displayName = 'BasicMap';

export { BasicMap };
