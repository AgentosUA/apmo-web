/**
 * Coordinate helpers, ported from OCAP2/web (ui/src/utils/coordinates.ts).
 *
 * Arma world space: X = east, Y = north, in meters, origin bottom-left.
 */

/** Arma coordinate in meters: [x, y]. */
export type ArmaCoord = [number, number];

/**
 * Meters per degree at the equator.
 * Used to map Arma meters to WGS-84 degrees in MapLibre (EPSG:3857) mode,
 * exactly like OCAP does (~0.1% error, no proj4 needed).
 */
export const METERS_PER_DEGREE = 111320;

/** Return the equivalent of `target` closest to `current` (avoids 359° → 0° spins). */
export const closestEquivalentAngle = (current: number, target: number) => {
  const delta = ((((target - current) % 360) + 540) % 360) - 180;
  return current + delta;
};

/** Arma `.sqm` object angles are stored in radians. */
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;
