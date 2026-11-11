/**
 * Area markers (ELLIPSE / RECTANGLE) geometry and brushes, ported from
 * OCAP2/web LeafletRenderer.updateBriefingMarker() / buildShapeOptions().
 *
 * Arma area marker sizes are HALF extents (markerSize [a, b]): an ellipse with
 * size [100, 50] is 200 m wide and 100 m tall. Directions are degrees,
 * clockwise from north. Geometry is computed in Arma meters and only then
 * projected, so it is exact at every zoom level.
 */
import L from 'leaflet';

import type { ArmaCoord } from './coordinates';

type ShapeKind = 'ellipse' | 'rectangle';

type ShapeItem = {
  id: string;
  kind: ShapeKind;
  /** Center, Arma meters. */
  x: number;
  y: number;
  /** Half extents, meters. */
  a: number;
  b: number;
  /** Degrees, clockwise from north. */
  direction: number;
  /** Hex color without '#'. */
  color: string;
  /** Arma brush (CfgMarkerBrushes) name, e.g. "Solid", "Border", "FDiagonal". */
  brush?: string;
  /** Marker alpha (0..1). */
  alpha?: number;
  /** When set, the shape is hoverable and Delete/Backspace removes it. */
  onDelete?: () => void;
  /** Drag to move: called with the new center. */
  onDragEnd?: (center: ArmaCoord) => void;
  /** Alt + drag to rotate (SWT): called with the new direction. */
  onRotateEnd?: (direction: number) => void;
};

const ELLIPSE_SEGMENTS = 64;

const rotateAround = (cx: number, cy: number, dx: number, dy: number, direction: number): ArmaCoord => {
  // Negate: Arma directions are clockwise, the rotation matrix is counter-clockwise.
  const rad = (-direction * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [cx + cos * dx - sin * dy, cy + sin * dx + cos * dy];
};

const getEllipsePoints = (shape: Pick<ShapeItem, 'x' | 'y' | 'a' | 'b' | 'direction'>): ArmaCoord[] => {
  const points: ArmaCoord[] = [];
  for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
    const angle = (i / ELLIPSE_SEGMENTS) * 2 * Math.PI;
    points.push(
      rotateAround(shape.x, shape.y, shape.a * Math.cos(angle), shape.b * Math.sin(angle), shape.direction)
    );
  }
  return points;
};

const getRectanglePoints = (shape: Pick<ShapeItem, 'x' | 'y' | 'a' | 'b' | 'direction'>): ArmaCoord[] =>
  (
    [
      [-shape.a, +shape.b],
      [+shape.a, +shape.b],
      [+shape.a, -shape.b],
      [-shape.a, -shape.b],
    ] as const
  ).map(([dx, dy]) => rotateAround(shape.x, shape.y, dx, dy, shape.direction));

const getShapePoints = (shape: ShapeItem) =>
  shape.kind === 'ellipse' ? getEllipsePoints(shape) : getRectanglePoints(shape);

// --------------- brushes ---------------

type BrushStyle = {
  stroke: boolean;
  fill: boolean;
  fillOpacity: number;
  pattern?: {
    type: 'stripe' | 'grid';
    angle?: number;
    weight: number;
    spaceWeight: number;
    opacity: number;
    bgOpacity?: number;
  };
};

const getBrushStyle = (brush?: string): BrushStyle => {
  switch (brush?.toLowerCase()) {
    case 'solidfull':
      return { stroke: false, fill: true, fillOpacity: 0.8 };
    case 'border':
      return { stroke: true, fill: false, fillOpacity: 0 };
    case 'solidborder':
      return { stroke: true, fill: true, fillOpacity: 0.3 };
    case 'horizontal':
      return { stroke: false, fill: true, fillOpacity: 0.2, pattern: { type: 'stripe', angle: 0, weight: 2, spaceWeight: 4, opacity: 1 } };
    case 'vertical':
      return { stroke: false, fill: true, fillOpacity: 0.2, pattern: { type: 'stripe', angle: 90, weight: 2, spaceWeight: 4, opacity: 1 } };
    case 'fdiagonal':
      return { stroke: false, fill: true, fillOpacity: 0.2, pattern: { type: 'stripe', angle: 315, weight: 2, spaceWeight: 6, opacity: 1 } };
    case 'bdiagonal':
      return { stroke: false, fill: true, fillOpacity: 0.2, pattern: { type: 'stripe', angle: 45, weight: 2, spaceWeight: 6, opacity: 1 } };
    case 'diaggrid':
      return { stroke: false, fill: true, fillOpacity: 0.2, pattern: { type: 'stripe', angle: 45, weight: 1, spaceWeight: 3, opacity: 0.8 } };
    case 'grid':
    case 'cross':
      return { stroke: false, fill: true, fillOpacity: 1, pattern: { type: 'grid', weight: 2, spaceWeight: 6, opacity: 0.5, bgOpacity: 0.3 } };
    case 'solid':
    default:
      return { stroke: false, fill: true, fillOpacity: 0.3 };
  }
};

// --------------- SVG fill patterns (OCAP svgPatterns.ts) ---------------

const SVG_NS = 'http://www.w3.org/2000/svg';
let patternCounter = 0;

const nextPatternId = () => `apmo-pat-${++patternCounter}`;

const ensureDefs = (svgRenderer: L.SVG): SVGDefsElement | null => {
  const container = (svgRenderer as unknown as { _container?: SVGSVGElement })._container;
  if (!container) return null;
  let defs = container.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    container.insertBefore(defs, container.firstChild);
  }
  return defs;
};

const svgLine = (x1: number, y1: number, x2: number, y2: number, color: string, weight: number, opacity: number) => {
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', String(weight));
  line.setAttribute('stroke-opacity', String(opacity));
  return line;
};

const createPattern = (defs: SVGDefsElement, id: string, color: string, pattern: NonNullable<BrushStyle['pattern']>) => {
  const size = pattern.weight + pattern.spaceWeight;
  const element = document.createElementNS(SVG_NS, 'pattern');
  element.setAttribute('id', id);
  element.setAttribute('width', String(size));
  element.setAttribute('height', String(size));
  element.setAttribute('patternUnits', 'userSpaceOnUse');

  if (pattern.type === 'stripe') {
    element.setAttribute('patternTransform', `rotate(${pattern.angle ?? 0})`);
    element.appendChild(svgLine(0, pattern.weight / 2, size, pattern.weight / 2, color, pattern.weight, pattern.opacity));
  } else {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', String(size));
    rect.setAttribute('height', String(size));
    rect.setAttribute('fill', color);
    rect.setAttribute('fill-opacity', String(pattern.bgOpacity ?? 0));
    element.appendChild(rect);
    element.appendChild(svgLine(0, pattern.weight / 2, size, pattern.weight / 2, color, pattern.weight, pattern.opacity));
    element.appendChild(svgLine(pattern.weight / 2, 0, pattern.weight / 2, size, color, pattern.weight, pattern.opacity));
  }

  defs.appendChild(element);
};

const removePattern = (defs: SVGDefsElement | null, id?: string) => {
  if (!defs || !id) return;
  defs.querySelector(`#${id}`)?.remove();
};

/**
 * Leaflet resets `fill` on every style update; re-apply url(#pattern).
 * (Same monkey-patch as OCAP patchSVGUpdateStyle.)
 */
const patchSVGUpdateStyle = () => {
  const proto = L.SVG.prototype as unknown as {
    _apmoPatched?: boolean;
    _updateStyle: (layer: { options?: { _fillPatternId?: string }; _path?: SVGPathElement }) => void;
  };
  if (proto._apmoPatched) return;
  const original = proto._updateStyle;
  proto._updateStyle = function (layer) {
    original.call(this, layer);
    if (layer.options?._fillPatternId && layer._path) {
      layer._path.setAttribute('fill', `url(#${layer.options._fillPatternId})`);
    }
  };
  proto._apmoPatched = true;
};

export {
  getEllipsePoints,
  getRectanglePoints,
  getShapePoints,
  getBrushStyle,
  ensureDefs,
  nextPatternId,
  createPattern,
  removePattern,
  patchSVGUpdateStyle,
};

export type { ShapeItem, ShapeKind, BrushStyle };
