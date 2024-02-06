import { FC } from 'react';

import { MapContainer, TileLayer } from 'react-leaflet';

const Map: FC<{}> = () => {
  return (
    <MapContainer center={[0, 0]} minZoom={0.125} maxZoom={8}>
      <TileLayer
        tileSize={20480}
        zoomOffset={300}
        url='https://stats.wogames.info/img/locations/reshmaan/z/x/y.png'
      />
      {/* <Marker>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker> */}
    </MapContainer>
    // <MapContainer zoom={9}>
    //   <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
    //   <Marker position={[51.505, -0.09]}>
    //     <Popup>
    //       A pretty CSS3 popup. <br /> Easily customizable.
    //     </Popup>
    //   </Marker>
    // </MapContainer>
  );
};

export default Map;
