import { Vehicle } from '@/entities/mission/types';

const getVehicleIconSizeByType = (vehicle: Vehicle) => {
  switch (vehicle.type) {
    case 'crate':
      return 16;
    case 'unknown':
      return 20;
    default:
      return 32;
  }
};

const rotatePoint = (
  cx: number,
  cy: number,
  x: number,
  y: number,
  angle = 0
) => {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (x - cx) - sin * (y - cy) + cx;
  const ny = sin * (x - cx) + cos * (y - cy) + cy;
  return [ny, nx]; // Return as [latitude, longitude]
};

const calculateRotatedRectangleCorners = (
  center: [number, number],
  width: number,
  height: number,
  angle = 0
) => {
  const [cy, cx] = center; // Center coordinates (latitude, longitude)
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Corners before rotation
  const corners = [
    [cy - halfHeight, cx - halfWidth], // Bottom-left
    [cy - halfHeight, cx + halfWidth], // Bottom-right
    [cy + halfHeight, cx + halfWidth], // Top-right
    [cy + halfHeight, cx - halfWidth], // Top-left
  ];

  // Rotate each corner
  return corners.map(([cornerY, cornerX]) =>
    rotatePoint(cx, cy, cornerX, cornerY, -angle)
  );
};

export {
  getVehicleIconSizeByType,
  calculateRotatedRectangleCorners,
  rotatePoint,
};
