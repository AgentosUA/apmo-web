'use client';

import { FC, PropsWithChildren } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';

import { CRS, Projection, extend, transformation } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import classNames from 'classnames';

import styles from './ui.module.scss';

const mapOffset = 1024;

const BasicMap: FC<
  PropsWithChildren<{
    className?: string;
    name: string;
    mapSize: number;
    minZoom: number;
    maxZoom: number;
  }>
> = ({ className, children, mapSize = 0, name }) => {
  const armaCRS = extend({}, CRS.Simple, {
    projection: Projection.LonLat,
    transformation: transformation(
      0.015625,
      0 * 0.015625,
      -0.015625,
      (mapSize + mapOffset) * 0.015625
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
          url={`https://stats.wogames.info/img/locations/${name}/{z}/{x}/{y}.png`}
          tileSize={256}
          minZoom={0}
          maxZoom={9}
          noWrap
        />
        {children}
      </MapContainer>
    </div>
  );
};

export default BasicMap;
