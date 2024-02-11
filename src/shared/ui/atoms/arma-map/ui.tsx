import { FC } from 'react';

import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import { CRS, Projection, extend, transformation } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import styles from './ui.module.scss';
import classNames from 'classnames';

const mapSize = 15360;
const mapOffset = 1024;

const Markers = () => {
  return (
    <>
      {/* <Marker
        position={armaToLeaflet(0, 0, armaBounds, leafletBounds)}
        title='test'
      /> */}
      <Marker position={[6010.17, 3726.8]} title='test' />
      <Marker position={[10209, 4574.73]} title='test' />
      <Marker position={[7793.67, 6169.01]} title='test' />

      {/* <Marker position={[11.019857421874999, 18.90093994140625]} title='test' /> */}
    </>
  );
};

const myCRS = extend({}, CRS.Simple, {
  projection: Projection.LonLat,
  transformation: transformation(
    0.015625,
    0 * 0.015625,
    -0.015625,
    (mapSize + mapOffset) * 0.015625
  ),
});

const ArmaMap: FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div id='map'>
      <MapContainer
        className={classNames(styles.map, className)}
        center={[mapSize / 1.9, mapSize / 2]}
        crs={myCRS}
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
          url='https://stats.wogames.info/img/locations/chernarus/{z}/{x}/{y}.png'
          tileSize={256}
          minZoom={0}
          maxZoom={9}
          noWrap
        />
        <Markers />
      </MapContainer>
    </div>
  );
};

export default ArmaMap;
