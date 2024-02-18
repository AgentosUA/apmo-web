'use client';

import { FC, PropsWithChildren } from 'react';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import {
  CRS,
  LeafletMouseEvent,
  Projection,
  extend,
  transformation,
} from 'leaflet';

import classNames from 'classnames';

import styles from './ui.module.scss';

const MapHandlers: FC<{
  onDoubleClick?: (event: LeafletMouseEvent) => void;
}> = ({ onDoubleClick }) => {
  const map = useMap();

  if (Boolean(onDoubleClick)) {
    map.addEventListener('dblclick', (event) => {
      onDoubleClick?.(event);
    });
  }

  return null;
};

const BasicMap: FC<
  PropsWithChildren<{
    className?: string;
    name: string;
    mapSize?: number;
    minZoom: number;
    maxZoom: number;
    scale?: number;
    dragging?: boolean;
    onDoubleClick?: (event: LeafletMouseEvent) => void;
  }>
> = ({
  className,
  children,
  mapSize = 0,
  name,
  minZoom = 0,
  maxZoom,
  dragging = true,
  onDoubleClick,
}) => {
  const armaCRS = extend({}, CRS.Simple, {
    projection: Projection.LonLat,
    transformation: transformation(
      256 / mapSize,
      0,
      -256 / mapSize,
      mapSize * (256 / mapSize)
    ),
  });

  const layers = [
    'terrain',
    'bushes',
    'count_main',
    'count',
    'roads',
    'objects',
  ];

  return (
    <div id='map'>
      <MapContainer
        className={classNames(styles.map, className)}
        center={[mapSize / 1.9, mapSize / 2]}
        crs={armaCRS}
        zoomControl={false}
        zoom={2}
        dragging={dragging}
        doubleClickZoom={false}
        worldCopyJump={false}
        maxBoundsViscosity={0.7}
        wheelPxPerZoomLevel={500}
        markerZoomAnimation>
        <MapHandlers onDoubleClick={onDoubleClick} />

        {layers.map((layer) => (
          <TileLayer
            key={layer}
            url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/${layer}/{z}/{x}_{y}.png`}
            // url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/{z}/{x}/{y}.png`}
            tileSize={256}
            minZoom={minZoom}
            maxZoom={maxZoom}
            noWrap
            detectRetina
          />
        ))}

        {children}
      </MapContainer>
    </div>
  );
};

export default BasicMap;
