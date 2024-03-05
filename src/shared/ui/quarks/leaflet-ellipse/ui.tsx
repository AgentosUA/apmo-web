import { FC, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-ellipse';
import { useMap } from 'react-leaflet';

const LeafletEllipse: FC<{
  center: [number, number];
  radii: [number, number];
  tilt: number;
  options?: L.PathOptions;
}> = ({ center = [0, 0], radii = [10, 10], tilt = 0, options }) => {
  // const context = useLeafletContext();
  const map = useMap();

  useEffect(() => {
    const ellipse = new L.Ellipse(center, radii, tilt, options);

    // container.addLayer(ellipse);

    ellipse.addTo(map);

    return () => {
      ellipse.removeFrom(map);
    };
  });

  return null;
};

export { LeafletEllipse };
