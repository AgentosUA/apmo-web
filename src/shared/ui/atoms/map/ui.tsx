import { FC } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const Map: FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div id='map'>
      <MapContainer
        className={className}
        center={[0, 0]}
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
      </MapContainer>
    </div>
  );
};

export default Map;
