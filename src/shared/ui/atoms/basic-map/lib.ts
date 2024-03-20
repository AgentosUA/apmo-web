import { CRS, Projection, extend, transformation } from 'leaflet';

const createArmaCRS = (mapSize: number) => {
  return extend({}, CRS.Simple, {
    projection: Projection.LonLat,
    transformation: transformation(
      256 / mapSize,
      0,
      -256 / mapSize,
      mapSize * (256 / mapSize)
    ),
  });
};

export { createArmaCRS };
