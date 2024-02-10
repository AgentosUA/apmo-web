import { FC, useEffect, useState } from 'react';

import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

import { CRS, LatLngBounds, Projection, extend, transformation } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const size = 15360;

type Bounds = {
  _northEast: {
    lat: number;
    lng: number;
  };
  _southWest: {
    lat: number;
    lng: number;
  };
};

const armaBounds: Bounds = {
  _northEast: {
    lat: 15360,
    lng: 15360,
  },
  _southWest: {
    lat: 0,
    lng: 0,
  },
};

// const armaToLeaflet = (
//   armaX = 0,
//   armaY = 0,
//   armaBounds: Bounds,
//   leafletBounds: Bounds
// ): [number, number] => {
//   // Calculate the width and height of the Arma 3 bounds
//   const armaWidth = armaBounds._northEast.lng - armaBounds._southWest.lng;
//   const armaHeight = armaBounds._northEast.lat - armaBounds._southWest.lat;

//   // Calculate the x and y ratios for conversion
//   const xRatio = armaWidth / leafletBounds._northEast.lng;
//   const yRatio = armaHeight / leafletBounds._northEast.lat;

//   // Convert Arma 3 coordinates to Leaflet coordinates
//   const leafletX = armaBounds._southWest.lng + armaX / xRatio;
//   const leafletY = armaBounds._southWest.lat + armaY / yRatio;

//   console.log('parsed: ', leafletX, leafletY);

//   return [leafletY, leafletX];
// };

const armaToLeaflet = (
  armaX = 0,
  armaY = 0,
  armaBounds: Bounds,
  leafletBounds: Bounds
): [number, number] => {
  // Calculate the width and height of the Arma 3 bounds
  const armaWidth = armaBounds._northEast.lng - armaBounds._southWest.lng;
  const armaHeight = armaBounds._northEast.lat - armaBounds._southWest.lat;

  // Calculate the x and y ratios for conversion
  const xRatio = armaWidth / leafletBounds._northEast.lng;
  const yRatio = armaHeight / leafletBounds._northEast.lat;

  // Convert Arma 3 coordinates to Leaflet coordinates
  const leafletX = armaBounds._southWest.lng + armaX / xRatio;
  const leafletY = armaBounds._southWest.lat + armaY / yRatio;

  console.log('parsed: ', leafletX, leafletY);

  return [leafletY, leafletX];
};

// const coords = armaToLeaflet(4574.73, 10209, size);
// const coords = [0, 0];
const MapHooked = () => {
  const map = useMap();

  const leafletBounds = {
    _northEast: {
      lat: map.getBounds().getNorthEast().lat,
      lng: map.getBounds().getNorthEast().lng,
    },
    _southWest: {
      lat: map.getBounds().getSouthWest().lat,
      lng: map.getBounds().getSouthWest().lng,
    },
  };

  useEffect(() => {
    // const lat = new LatLng(
    //   -size / (0.0078125 * Math.pow(2, map.getZoom())) / 2,
    //   size / (0.0078125 * Math.pow(2, map.getZoom())) / 2
    // );
    // const lng = new LatLng(
    //   size / (0.0078125 * Math.pow(2, map.getZoom())) / 2,
    //   -size / (0.0078125 * Math.pow(2, map.getZoom())) / 2
    // );

    map.setMaxBounds;
  }, []);

  return (
    <>
      {/* <Marker
        position={armaToLeaflet(0, 0, armaBounds, leafletBounds)}
        title='test'
      /> */}
      <Marker position={[15360 - 4574.73, 15360 - 10209]} title='test' />

      {/* <Marker position={[11.019857421874999, 18.90093994140625]} title='test' /> */}
    </>
  );
};

// const bounds = [[0, 0], armaToLeaflet(15360, 15360)] as [
//   [number, number],
//   [number, number]
// ];

const myCRS = extend({}, CRS.Simple, {
  // At zoom 0, tile 268x268px should represent the entire "world" of size 8576x8576.
  // scale is therefore 8576 / 268 = 32 (use the reverse in transformation, i.e. 1/32).
  // We want the center of tile 0/0/0 to be coordinates [0, 0], so offset is 8576 * 1/32 / 2 = 268 / 2 = 134.
  projection: Projection.LonLat,
  transformation: transformation(
    0.015625,
    0 * 0.015625,
    -0.015625,
    16384 * 0.015625
  ),
  infinte: true,
});

const Map: FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div id='map'>
      <MapContainer
        className={className}
        center={[0, 0]}
        crs={myCRS}
        zoomControl={false}
        zoom={3.5}
        // minZoom={1}
        // maxZoom={9}
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
        <MapHooked />
      </MapContainer>
    </div>
  );
};

export default Map;
