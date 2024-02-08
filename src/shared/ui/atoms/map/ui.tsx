import { FC } from 'react';

import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

import { CRS } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const Map: FC<{
  className?: string;
}> = ({ className }) => {
  // const map = useMap();

  return (
    <div id='map'>
      <MapContainer
        className={className}
        center={[0, 0]}
        crs={CRS.Simple}
        zoomControl={false}
        zoom={3.5}
        minZoom={0}
        maxZoom={9}
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
        <br />
        <Marker position={[0.100, 100]} title='test' />
      </MapContainer>
    </div>
  );
};

export default Map;
