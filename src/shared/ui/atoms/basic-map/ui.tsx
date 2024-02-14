'use client';

import { FC, PropsWithChildren } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';

import { CRS, Projection, extend, transformation } from 'leaflet';

import classNames from 'classnames';

import styles from './ui.module.scss';

const BasicMap: FC<
  PropsWithChildren<{
    className?: string;
    name: string;
    mapSize?: number;
    minZoom: number;
    maxZoom: number;
    scale?: number;
  }>
> = ({ className, children, name, minZoom = 0, maxZoom }) => {
  const mapSize = 8192;
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
        worldCopyJump={false}
        maxBoundsViscosity={0.7}
        wheelPxPerZoomLevel={500}
        markerZoomAnimation
        style={{
          minHeight: '100vh',
        }}>
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
