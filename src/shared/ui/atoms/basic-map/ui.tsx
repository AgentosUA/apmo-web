'use client';

import { FC, PropsWithChildren, useEffect } from 'react';

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
    onDoubleClick?: (event: LeafletMouseEvent) => void;
    onZoomLevelChange?: (zoomLevel: number) => void;
  }>
> = ({
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
        zoom={defaultZoom}
        dragging={dragging}
        doubleClickZoom={false}
        worldCopyJump={false}
        maxBoundsViscosity={0.7}
        wheelPxPerZoomLevel={500}
        markerZoomAnimation>
        <MapHandlers
          onDoubleClick={onDoubleClick}
          onZoomLevelChange={onZoomLevelChange}
        />

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
