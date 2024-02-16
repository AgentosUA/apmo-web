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
    onDoubleClick?: (event: LeafletMouseEvent) => void;
  }>
> = ({
  className,
  children,
  mapSize = 0,
  name,
  minZoom = 0,
  maxZoom,
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

  return (
    <div id='map'>
      <MapContainer
        className={classNames(styles.map, className)}
        center={[mapSize / 1.9, mapSize / 2]}
        crs={armaCRS}
        zoomControl={false}
        zoom={2}
        doubleClickZoom={false}
        worldCopyJump={false}
        maxBoundsViscosity={0.7}
        wheelPxPerZoomLevel={500}
        markerZoomAnimation>
        <MapHandlers onDoubleClick={onDoubleClick} />
        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/terrain/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
          detectRetina
        />
        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/bushes/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
          detectRetina
        />
        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/count_main/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
          detectRetina
        />
        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/count/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
        />

        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/roads/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
          detectRetina
        />

        <TileLayer
          url={`${process.env.NEXT_PUBLIC_TERRAINS_URL}/maps/${name}/objects/{z}/{x}_{y}.png`}
          tileSize={256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          noWrap
          detectRetina
        />

        {children}
      </MapContainer>
    </div>
  );
};

export default BasicMap;
