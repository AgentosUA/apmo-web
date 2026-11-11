/**
 * Imperative Arma map renderer, modelled on OCAP2/web LeafletRenderer +
 * CanvasLeafletRenderer (ui/src/renderers/leaflet/*).
 *
 * Two modes, picked from the world's OCAP `map.json`:
 *  - MapLibre (vector PMTiles, `maplibre: true`): EPSG:3857 CRS, Arma meters
 *    are mapped to degrees (÷ 111320). Basemap is a MapLibre GL layer.
 *  - Legacy raster tiles: custom CRS.Simple with OCAP's pixel transformation.
 *
 * Icons + labels are drawn on a single canvas (CanvasLayer); area markers are
 * SVG polygons computed in Arma meters (shapes.ts).
 */
import L from 'leaflet';

import { CanvasLayer, CanvasItem } from './canvas-layer';
import { ArmaCoord, METERS_PER_DEGREE } from './coordinates';
import {
  createPattern,
  ensureDefs,
  getBrushStyle,
  getShapePoints,
  nextPatternId,
  patchSVGUpdateStyle,
  removePattern,
  ShapeItem,
} from './shapes';
import type { WorldConfig } from './worlds';

type MapLibreStyleCandidate = { label: string; url: string };

/** A Sweet Markers line / ellipse drawn with the mouse (SWT marker params). */
type DrawnShape = {
  kind: 'line' | 'ellipse';
  /** Marker position: line middle / ellipse center. */
  center: ArmaCoord;
  /** Degrees, clockwise from north. */
  direction: number;
  /** Line: [thickness, half length]; ellipse: [half width, half height]. */
  size: [number, number];
};

type RendererEvents = {
  dblclick: (position: ArmaCoord, event: MouseEvent) => void;
  zoom: (zoom: number) => void;
  /** Ctrl+Alt+drag (line) / Shift+Alt+drag (ellipse) finished. */
  drawShape: (shape: DrawnShape) => void;
  /** Ctrl+click: place a marker with the last used type/color. */
  quickMarker: (position: ArmaCoord) => void;
};

/** SWT defaults (swt_markers_a3 UI/MapHandlers.sqf). */
const SWT_LINE_THICKNESS = 5;
const SWT_LINE_THICKNESS_STEP = 5;
const SWT_LINE_THICKNESS_MAX = 100;
const SWT_ELLIPSE_MAX = 2000;

const bearing = (from: ArmaCoord, to: ArmaCoord) =>
  ((Math.atan2(to[0] - from[0], to[1] - from[1]) * 180) / Math.PI + 360) % 360;

const round2 = (value: number) => Math.round(value * 100) / 100;

type ShapeHandle = {
  shape: ShapeItem;
  polygon: L.Polygon;
  patternId?: string;
  signature: string;
};

const MAPLIBRE_STYLE_STORAGE_KEY = 'apmo-maplibre-style';

class ArmaMapRenderer {
  readonly world: WorldConfig;
  readonly isMapLibre: boolean;
  map!: L.Map;

  private container: HTMLElement;
  private imageSize: number;
  private multiplier: number;
  private maxNativeZoom: number;

  private canvasLayer!: CanvasLayer;
  private svgRenderer!: L.SVG;
  private svgDefs: SVGDefsElement | null = null;
  private shapesLayer = L.layerGroup();
  private shapes = new Map<string, Map<string, ShapeHandle>>();
  private maplibreLayer: L.Layer | null = null;
  private styleCandidates: MapLibreStyleCandidate[] = [];

  private listeners: { [K in keyof RendererEvents]: Set<RendererEvents[K]> } = {
    dblclick: new Set(),
    zoom: new Set(),
    drawShape: new Set(),
    quickMarker: new Set(),
  };

  private interactive = true;
  private hovered: CanvasItem | null = null;
  private hoveredShape: ShapeHandle | null = null;
  private shapeDrag: {
    handle: ShapeHandle;
    mode: 'move' | 'rotate';
    start: ArmaCoord;
    startPoint: L.Point;
    moved: boolean;
    pointerId: number;
    center: ArmaCoord;
    direction: number;
  } | null = null;
  private drag: {
    item: CanvasItem;
    mode: 'move' | 'rotate';
    start: L.Point;
    moved: boolean;
    pointerId: number;
    direction?: number;
  } | null = null;
  private draw: {
    kind: DrawnShape['kind'];
    start: ArmaCoord;
    end: ArmaCoord;
    thickness: number;
    pointerId: number;
  } | null = null;
  private drawColor = '0000ff';
  private suppressClick = false;
  private disposed = false;
  /** Own wheel / pinch zoom (Leaflet's scrollWheelZoom is off). */
  private wheelZoomEnabled = true;
  private zoomTarget: number | null = null;
  private zoomAnchor: L.Point | null = null;
  private zoomFrame: number | null = null;
  private gestureStartZoom = 0;

  constructor(container: HTMLElement, world: WorldConfig) {
    this.container = container;
    this.world = world;
    this.isMapLibre = Boolean(world.maplibre);
    this.imageSize = world.imageSize ?? world.worldSize;
    this.multiplier = world.multiplier ?? 1;
    this.maxNativeZoom = world.maxZoom;

    patchSVGUpdateStyle();

    if (this.isMapLibre) this.initMapLibreMode();
    else this.initLegacyMode();

    this.svgRenderer = L.svg({ padding: 0.5 });
    this.svgRenderer.addTo(this.map);
    this.svgDefs = ensureDefs(this.svgRenderer);
    this.shapesLayer.addTo(this.map);

    this.canvasLayer = new CanvasLayer(this.map, {
      armaToLatLng: (coords) => this.armaToLatLng(coords),
      fontFamily: getFontFamily(container),
    });

    this.bindEvents();
  }

  // ==================== init ====================

  private initMapLibreMode() {
    const worldSizeDeg = this.world.worldSize / METERS_PER_DEGREE;

    this.map = L.map(this.container, {
      center: [worldSizeDeg / 2, worldSizeDeg / 2],
      zoom: 12,
      maxZoom: 20,
      minZoom: 10,
      zoomControl: false,
      keyboard: false,
      doubleClickZoom: false,
      boxZoom: false,
      zoomAnimation: true,
      fadeAnimation: true,
      crs: L.CRS.EPSG3857,
      attributionControl: false,
      // Fractional zoom: wheel / trackpad zoom is handled smoothly by onWheel.
      zoomSnap: 0,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      closePopupOnClick: true,
      preferCanvas: false,
      // No maxBounds (same as OCAP): when the whole world fits on screen,
      // Leaflet would re-center the view on every pan.
    });

    const base = this.world.tileBaseUrl ?? '';
    const styleBase = `${base}/styles/`;
    this.styleCandidates = [
      { label: 'Topographic', url: `${styleBase}topo.json` },
      { label: 'Topographic Dark', url: `${styleBase}topo-dark.json` },
      { label: 'Color Relief', url: `${styleBase}color-relief.json` },
      { label: 'Topographic Relief', url: `${styleBase}topo-relief.json` },
    ];

    void this.addMapLibreBasemap();

    this.map.fitBounds(L.latLngBounds(L.latLng(0, 0), L.latLng(worldSizeDeg, worldSizeDeg)));
  }

  private async addMapLibreBasemap() {
    if (!this.world.tileBaseUrl) return;

    // Relative URLs inside OCAP style documents are root-relative to the
    // server that hosts them (OCAP resolves them against its app base).
    const styleOrigin = new URL(this.world.tileBaseUrl, window.location.origin).origin + '/';
    const isAbsoluteUrl = (u: string) => /^(\w+:)?\/\/|^data:/.test(u);
    const makeAbsolute = (u: string) => (isAbsoluteUrl(u) ? u : styleOrigin + u.replace(/^\//, ''));

    const [maplibregl, { Protocol }] = await Promise.all([
      import('maplibre-gl'),
      import('pmtiles'),
    ]);

    const globalScope = window as unknown as { __apmoPmtilesRegistered?: boolean };
    if (!globalScope.__apmoPmtilesRegistered) {
      // Style sources are made absolute in fetchStyle(), so the handler is server-agnostic.
      const protocol = new Protocol();
      maplibregl.addProtocol('pmtiles', (params, abortController) => protocol.tile(params, abortController));
      globalScope.__apmoPmtilesRegistered = true;
    }

    const fetchStyle = async (url: string) => {
      const response = await fetch(url);
      const style = await response.json();
      if (typeof style.sprite === 'string') style.sprite = makeAbsolute(style.sprite);
      else if (Array.isArray(style.sprite)) {
        style.sprite = style.sprite.map((s: { url: string }) => ({ ...s, url: makeAbsolute(s.url) }));
      }
      if (typeof style.glyphs === 'string') style.glyphs = makeAbsolute(style.glyphs);
      // OCAP styles reference archives as root-relative `pmtiles://images/maps/…`.
      // Make them absolute so several map servers can be used in one session.
      const absolutePmtiles = (u: string) =>
        u.startsWith('pmtiles://') ? `pmtiles://${makeAbsolute(u.slice('pmtiles://'.length))}` : makeAbsolute(u);
      Object.values((style.sources ?? {}) as Record<string, { url?: string; tiles?: string[] }>).forEach((source) => {
        if (typeof source.url === 'string') source.url = absolutePmtiles(source.url);
        if (Array.isArray(source.tiles)) source.tiles = source.tiles.map(absolutePmtiles);
      });
      return style;
    };

    let savedIndex = 0;
    try {
      savedIndex = parseInt(localStorage.getItem(MAPLIBRE_STYLE_STORAGE_KEY) ?? '0', 10) || 0;
    } catch {
      /* storage unavailable */
    }
    const candidate = this.styleCandidates[savedIndex] ?? this.styleCandidates[0];

    let style: unknown;
    try {
      style = await fetchStyle(candidate.url);
    } catch {
      style = await fetchStyle(this.styleCandidates[0].url);
    }

    await import('@maplibre/maplibre-gl-leaflet');
    if (this.disposed) return;

    const leafletWithMapLibre = L as unknown as {
      maplibreGL: (options: Record<string, unknown>) => L.Layer;
    };

    this.maplibreLayer = leafletWithMapLibre.maplibreGL({
      style,
      interactive: false,
      renderWorldCopies: false,
      transformRequest: (url: string) => ({ url: makeAbsolute(url) }),
    });
    this.maplibreLayer.addTo(this.map);
    this.fetchStyle = fetchStyle;
  }

  private fetchStyle: ((url: string) => Promise<unknown>) | null = null;

  /** Available MapLibre styles (topo, dark, relief…). */
  getStyles() {
    return this.styleCandidates.map((candidate) => candidate.label);
  }

  async setStyle(index: number) {
    const candidate = this.styleCandidates[index];
    if (!candidate || !this.maplibreLayer || !this.fetchStyle) return;
    const glMap = (this.maplibreLayer as unknown as { getMaplibreMap?: () => { setStyle: (s: unknown) => void } })
      .getMaplibreMap?.();
    if (!glMap) return;
    glMap.setStyle(await this.fetchStyle(candidate.url));
    try {
      localStorage.setItem(MAPLIBRE_STYLE_STORAGE_KEY, String(index));
    } catch {
      /* storage unavailable */
    }
  }

  private initLegacyMode() {
    const factor = this.multiplier;
    const maxZoom = this.maxNativeZoom + 2;

    const OCAP_CRS = L.extend({}, L.CRS.Simple, {
      projection: L.Projection.LonLat,
      transformation: new L.Transformation(factor, 0, -factor, 0),
      scale(zoom: number) {
        return Math.pow(2, zoom);
      },
      zoom(scale: number) {
        return Math.log(scale) / Math.LN2;
      },
      distance(a: L.LatLng, b: L.LatLng) {
        const dx = b.lng - a.lng;
        const dy = b.lat - a.lat;
        return Math.sqrt(dx * dx + dy * dy);
      },
      infinite: true,
    });

    this.map = L.map(this.container, {
      center: [0, 0],
      zoom: 0,
      maxZoom,
      minZoom: this.world.minZoom ?? 0,
      zoomControl: false,
      keyboard: false,
      doubleClickZoom: false,
      boxZoom: false,
      zoomAnimation: true,
      fadeAnimation: true,
      crs: OCAP_CRS,
      attributionControl: false,
      // Fractional zoom: wheel / trackpad zoom is handled smoothly by onWheel.
      zoomSnap: 0,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      closePopupOnClick: true,
    });

    const imgSize = this.imageSize;
    const nz = this.maxNativeZoom;
    const bounds = new L.LatLngBounds(this.map.unproject([0, imgSize], nz), this.map.unproject([imgSize, 0], nz));

    if (this.world.tileBaseUrl) {
      L.tileLayer(`${this.world.tileBaseUrl}/{z}/{x}/{y}.png`, {
        maxNativeZoom: this.world.maxZoom,
        minNativeZoom: this.world.minZoom,
        maxZoom,
        bounds,
        noWrap: true,
        keepBuffer: 4,
        attribution: this.world.attribution,
      } as L.TileLayerOptions).addTo(this.map);
    }

    this.map.fitBounds(bounds);
  }

  // ==================== coordinates ====================

  armaToLatLng(coords: ArmaCoord): L.LatLng {
    if (this.isMapLibre) {
      return L.latLng(coords[1] / METERS_PER_DEGREE, coords[0] / METERS_PER_DEGREE);
    }
    return this.map.unproject([coords[0] * this.multiplier, this.imageSize - coords[1] * this.multiplier], this.maxNativeZoom);
  }

  latLngToArma(latlng: L.LatLng): ArmaCoord {
    if (this.isMapLibre) {
      return [latlng.lng * METERS_PER_DEGREE, latlng.lat * METERS_PER_DEGREE];
    }
    const point = this.map.project(latlng, this.maxNativeZoom);
    return [point.x / this.multiplier, (this.imageSize - point.y) / this.multiplier];
  }

  containerPointToArma(point: L.Point): ArmaCoord {
    return this.latLngToArma(this.map.containerPointToLatLng(point));
  }

  // ==================== camera ====================

  getZoom() {
    return this.map.getZoom();
  }

  /** Zoom used when focusing a point (≈ 1:10 000). */
  get focusZoom() {
    return this.isMapLibre ? 17 : this.maxNativeZoom + 1;
  }

  flyTo(position: ArmaCoord, zoom = this.focusZoom) {
    this.map.flyTo(this.armaToLatLng(position), zoom, { duration: 0.8 });
  }

  // ==================== icons / labels ====================

  setItems(layerKey: string, items: CanvasItem[], zIndex = 0) {
    this.canvasLayer.setLayer(layerKey, items, zIndex);
  }

  removeItems(layerKey: string) {
    this.canvasLayer.removeLayer(layerKey);
  }

  // ==================== area markers ====================

  setShapes(layerKey: string, items: ShapeItem[]) {
    const previous = this.shapes.get(layerKey) ?? new Map<string, ShapeHandle>();
    const next = new Map<string, ShapeHandle>();

    for (const shape of items) {
      const signature = JSON.stringify([shape.kind, shape.x, shape.y, shape.a, shape.b, shape.direction, shape.color, shape.brush, shape.alpha]);
      const existing = previous.get(shape.id);

      if (existing && existing.signature === signature) {
        existing.shape = shape;
        next.set(shape.id, existing);
        previous.delete(shape.id);
        continue;
      }

      if (existing) {
        this.removeShape(existing);
        previous.delete(shape.id);
      }

      next.set(shape.id, this.createShape(shape, signature));
    }

    previous.forEach((handle) => this.removeShape(handle));
    this.shapes.set(layerKey, next);
  }

  private createShape(shape: ShapeItem, signature: string): ShapeHandle {
    const color = `#${shape.color}`;
    const style = getBrushStyle(shape.brush);
    const alpha = shape.alpha ?? 1;
    const options: L.PolylineOptions & { _fillPatternId?: string } = {
      color,
      fillColor: color,
      stroke: style.stroke,
      fill: style.fill,
      weight: 2,
      opacity: style.stroke && alpha > 0 ? alpha : 0,
      fillOpacity: style.fill ? Math.min(style.fillOpacity, alpha) : 0,
      interactive: Boolean(shape.onDelete || shape.onDragEnd || shape.onRotateEnd),
      bubblingMouseEvents: true,
      renderer: this.svgRenderer,
    };

    let patternId: string | undefined;
    if (style.pattern && this.svgDefs) {
      patternId = nextPatternId();
      createPattern(this.svgDefs, patternId, color, style.pattern);
      options._fillPatternId = patternId;
    }

    const latlngs = getShapePoints(shape).map((point) => this.armaToLatLng(point));
    const polygon = L.polygon(latlngs, options);
    polygon.addTo(this.shapesLayer);

    const handle: ShapeHandle = { shape, polygon, patternId, signature };
    if (options.interactive) {
      polygon.on('mouseover', () => {
        this.hoveredShape = handle;
      });
      polygon.on('mouseout', () => {
        if (this.hoveredShape === handle) this.hoveredShape = null;
      });
    }

    return handle;
  }

  private removeShape(handle: ShapeHandle) {
    if (this.hoveredShape === handle) this.hoveredShape = null;
    handle.polygon.off();
    this.shapesLayer.removeLayer(handle.polygon);
    removePattern(this.svgDefs, handle.patternId);
  }

  // ==================== popups ====================

  openPopup(position: ArmaCoord, content: string | HTMLElement, onClose?: () => void) {
    const popup = L.popup({ closeButton: false, autoPan: false, className: 'apmo-popup', offset: [0, -6] })
      .setLatLng(this.armaToLatLng(position))
      .setContent(content);
    if (onClose) popup.on('remove', onClose);
    popup.openOn(this.map);
    return popup;
  }

  // ==================== interaction ====================

  /** Enable/disable map panning & wheel zoom (e.g. while a dialog is open). */
  setInteractive(enabled: boolean) {
    this.interactive = enabled;
    if (enabled) {
      this.map.dragging.enable();
      this.wheelZoomEnabled = true;
    } else {
      this.map.dragging.disable();
      this.wheelZoomEnabled = false;
    }
  }

  on<K extends keyof RendererEvents>(event: K, listener: RendererEvents[K]) {
    (this.listeners[event] as Set<RendererEvents[K]>).add(listener);
    return () => {
      (this.listeners[event] as Set<RendererEvents[K]>).delete(listener);
    };
  }

  private emit<K extends keyof RendererEvents>(event: K, ...args: Parameters<RendererEvents[K]>) {
    (this.listeners[event] as Set<(...a: Parameters<RendererEvents[K]>) => void>).forEach((listener) =>
      listener(...args)
    );
  }

  private pointFromEvent(event: MouseEvent | PointerEvent) {
    return this.map.mouseEventToContainerPoint(event as MouseEvent);
  }

  /** Color (hex without '#') of the line / ellipse being drawn. */
  setDrawColor(color: string) {
    this.drawColor = color;
    if (this.draw) this.updateDrawPreview();
  }

  private lockMap() {
    this.map.dragging.disable();
    this.wheelZoomEnabled = false;
  }

  private unlockMap() {
    if (!this.interactive) return;
    this.map.dragging.enable();
    this.wheelZoomEnabled = true;
  }

  private suppressNextClick() {
    this.suppressClick = true;
    setTimeout(() => {
      this.suppressClick = false;
    }, 0);
  }

  private onPointerDown = (event: PointerEvent) => {
    if (!this.interactive || event.button !== 0) return;
    const point = this.pointFromEvent(event);
    const ctrl = event.ctrlKey || event.metaKey;
    const alt = event.altKey;
    const shift = event.shiftKey;

    const capture = () => {
      // preventDefault also suppresses the compatibility mousedown, so
      // Leaflet does not start panning.
      event.preventDefault();
      event.stopPropagation();
      this.container.setPointerCapture?.(event.pointerId);
    };

    // Ctrl+Alt+drag → line, Shift+Alt+drag → ellipse (SWT).
    if (alt && (ctrl !== shift)) {
      const position = this.containerPointToArma(point);
      this.draw = {
        kind: ctrl ? 'line' : 'ellipse',
        start: position,
        end: position,
        thickness: SWT_LINE_THICKNESS,
        pointerId: event.pointerId,
      };
      this.lockMap();
      capture();
      this.updateDrawPreview();
      return;
    }

    // Ctrl+click → quick marker (SWT "fast" marker).
    if (ctrl && !alt && !shift) {
      capture();
      this.suppressNextClick();
      this.emit('quickMarker', this.containerPointToArma(point));
      return;
    }

    const item = this.canvasLayer.hitTest(point);

    // Lines / ellipses: drag → move, Alt+drag → rotate.
    const shapeHandle = this.hoveredShape;
    if (!item && shapeHandle && !ctrl && !shift) {
      const { shape } = shapeHandle;
      const mode = alt ? 'rotate' : 'move';
      if ((mode === 'move' && shape.onDragEnd) || (mode === 'rotate' && shape.onRotateEnd)) {
        this.shapeDrag = {
          handle: shapeHandle,
          mode,
          start: this.containerPointToArma(point),
          startPoint: point,
          moved: false,
          pointerId: event.pointerId,
          center: [shape.x, shape.y],
          direction: shape.direction,
        };
        this.lockMap();
        capture();
      }
      return;
    }

    if (!item) return;

    // Alt+drag on a marker → rotate; drag → move.
    if (alt && !ctrl && !shift && item.onRotateEnd) {
      this.drag = { item, mode: 'rotate', start: point, moved: false, pointerId: event.pointerId };
    } else if (!alt && !ctrl && !shift && item.draggable) {
      this.drag = { item, mode: 'move', start: point, moved: false, pointerId: event.pointerId };
    } else {
      return;
    }

    this.lockMap();
    capture();
  };

  private onPointerMove = (event: PointerEvent) => {
    const point = this.pointFromEvent(event);

    if (this.draw) {
      const position = this.containerPointToArma(point);
      if (this.draw.kind === 'ellipse') {
        const [sx, sy] = this.draw.start;
        if (Math.abs(position[0] - sx) > SWT_ELLIPSE_MAX || Math.abs(position[1] - sy) > SWT_ELLIPSE_MAX) return;
      }
      this.draw.end = position;
      this.updateDrawPreview();
      return;
    }

    if (this.shapeDrag) {
      const drag = this.shapeDrag;
      if (!drag.moved && point.distanceTo(drag.startPoint) < 3) return;
      drag.moved = true;
      const position = this.containerPointToArma(point);
      const { shape } = drag.handle;

      if (drag.mode === 'move') {
        drag.center = [
          round2(shape.x + position[0] - drag.start[0]),
          round2(shape.y + position[1] - drag.start[1]),
        ];
        this.container.style.cursor = 'grabbing';
      } else {
        drag.direction = Math.round(bearing([shape.x, shape.y], position));
        this.container.style.cursor = 'alias';
      }

      drag.handle.polygon.setLatLngs(
        getShapePoints({ ...shape, x: drag.center[0], y: drag.center[1], direction: drag.direction }).map(
          (p) => this.armaToLatLng(p)
        )
      );
      return;
    }

    if (this.drag) {
      if (!this.drag.moved && point.distanceTo(this.drag.start) < 3) return;
      this.drag.moved = true;
      const position = this.containerPointToArma(point);
      const item = this.drag.item;

      if (this.drag.mode === 'rotate') {
        this.drag.direction = bearing([item.x, item.y], position);
        this.canvasLayer.setDragOverride(item, [item.x, item.y], false, this.drag.direction);
        this.container.style.cursor = 'alias';
      } else {
        this.canvasLayer.setDragOverride(item, position);
        this.container.style.cursor = 'grabbing';
      }
      return;
    }

    const item = this.canvasLayer.hitTest(point);
    this.hovered = item;
    this.container.style.cursor = item?.draggable ? 'grab' : item?.onClick ? 'pointer' : '';
  };

  private onPointerUp = (event: PointerEvent) => {
    if (this.draw) {
      this.finishDraw(true);
      return;
    }

    if (this.shapeDrag) {
      const shapeDrag = this.shapeDrag;
      this.shapeDrag = null;
      this.container.releasePointerCapture?.(shapeDrag.pointerId);
      this.unlockMap();
      this.container.style.cursor = '';
      if (!shapeDrag.moved) return;
      this.suppressNextClick();

      const { shape } = shapeDrag.handle;
      // The polygon keeps the preview geometry until the updated shape arrives.
      if (shapeDrag.mode === 'move') shape.onDragEnd?.(shapeDrag.center);
      else shape.onRotateEnd?.(shapeDrag.direction);
      return;
    }

    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    this.container.releasePointerCapture?.(drag.pointerId);
    this.unlockMap();
    this.container.style.cursor = '';

    if (!drag.moved) return;
    this.suppressNextClick();

    if (drag.mode === 'rotate' && drag.direction !== undefined && drag.item.onRotateEnd) {
      this.canvasLayer.setDragOverride(drag.item, [drag.item.x, drag.item.y], true, drag.direction);
      drag.item.onRotateEnd(drag.item, Math.round(drag.direction));
      return;
    }

    const position = this.containerPointToArma(this.pointFromEvent(event));
    if (drag.item.onDragEnd) {
      // Keep drawing at the dropped position until the updated items arrive
      // (CanvasLayer.setLayer clears the override), so there is no flicker.
      this.canvasLayer.setDragOverride(drag.item, position, true);
      drag.item.onDragEnd(drag.item, position);
    } else {
      this.canvasLayer.setDragOverride(null);
    }
  };

  // ==================== SWT line / ellipse drawing ====================

  private getDrawnShape(): DrawnShape | null {
    const draw = this.draw;
    if (!draw) return null;
    const [sx, sy] = draw.start;
    const [ex, ey] = draw.end;

    if (draw.kind === 'line') {
      const halfLength = Math.hypot(ex - sx, ey - sy) / 2;
      return {
        kind: 'line',
        center: [round2((sx + ex) / 2), round2((sy + ey) / 2)],
        direction: round2(bearing(draw.start, draw.end)),
        size: [draw.thickness, round2(halfLength)],
      };
    }

    return {
      kind: 'ellipse',
      center: [round2(sx), round2(sy)],
      direction: 0,
      size: [round2(Math.abs(ex - sx)), round2(Math.abs(ey - sy))],
    };
  }

  private updateDrawPreview() {
    const shape = this.getDrawnShape();
    if (!shape) return;

    this.setShapes('__draw', [
      {
        id: '__draw',
        kind: shape.kind === 'line' ? 'rectangle' : 'ellipse',
        x: shape.center[0],
        y: shape.center[1],
        a: shape.size[0],
        b: shape.size[1],
        direction: shape.direction,
        color: this.drawColor,
        brush: shape.kind === 'line' ? 'SolidFull' : 'Solid',
      },
    ]);

    const text =
      shape.kind === 'line'
        ? `${shape.size[0]} m · ${Math.round(shape.size[1] * 2)} m`
        : `w: ${Math.round(shape.size[0])}, h: ${Math.round(shape.size[1])}`;

    this.setItems(
      '__draw',
      [{ id: '__draw-info', x: shape.center[0], y: shape.center[1], label: { text, color: '#ffffff', size: 12, align: 'center' } }],
      1000
    );
  }

  private finishDraw(commit: boolean) {
    const draw = this.draw;
    if (!draw) return;
    const shape = this.getDrawnShape();
    this.draw = null;
    this.container.releasePointerCapture?.(draw.pointerId);
    this.setShapes('__draw', []);
    this.removeItems('__draw');
    this.unlockMap();
    this.suppressNextClick();

    const moved = draw.start[0] !== draw.end[0] || draw.start[1] !== draw.end[1];
    if (commit && shape && moved && shape.size[1] > 0 && shape.size[0] > 0) {
      this.emit('drawShape', shape);
    }
  }

  private changeLineThickness(delta: number) {
    if (this.draw?.kind !== 'line') return;
    const next = this.draw.thickness + delta;
    if (next < SWT_LINE_THICKNESS || next > SWT_LINE_THICKNESS_MAX) return;
    this.draw.thickness = next;
    this.updateDrawPreview();
  }

  private lastWheelStep = 0;

  /** Shift + wheel is reported as horizontal scroll on some systems. */
  private wheelStep(event: WheelEvent) {
    const delta = event.deltaY || event.deltaX;
    if (!delta) return 0;
    // One step per wheel "notch" (trackpads fire many events).
    const now = performance.now();
    if (now - this.lastWheelStep < 150) return 0;
    this.lastWheelStep = now;
    return delta < 0 ? 1 : -1;
  }

  private onWheel = (event: WheelEvent) => {
    // Line thickness while drawing.
    if (this.draw?.kind === 'line') {
      event.preventDefault();
      event.stopPropagation();
      const step = this.wheelStep(event);
      if (step) this.changeLineThickness(step * SWT_LINE_THICKNESS_STEP);
      return;
    }

    // Shift + wheel over a marker → icon size (SWT 0.7 / 1 / 1.3).
    if (event.shiftKey && this.interactive) {
      const item = this.canvasLayer.hitTest(this.pointFromEvent(event));
      if (!item?.onResize) return;
      // Capture phase: keep Leaflet from zooming.
      event.preventDefault();
      event.stopPropagation();
      const step = this.wheelStep(event);
      if (step) item.onResize(item, step);
      return;
    }

    this.wheelZoom(event);
  };

  /**
   * Smooth zoom for mouse wheel, trackpad scroll and trackpad pinch.
   * macOS pinch arrives as wheel events with ctrlKey and small deltas.
   */
  private wheelZoom(event: WheelEvent) {
    // Let popups / controls inside the map scroll normally.
    const target = event.target as Element | null;
    if (target?.closest?.('.leaflet-popup, .leaflet-control')) return;
    // Always stop the browser page zoom on pinch over the map.
    if (event.ctrlKey) event.preventDefault();
    if (!this.wheelZoomEnabled) return;
    event.preventDefault();
    event.stopPropagation();

    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 20; // lines
    else if (event.deltaMode === 2) delta *= 400; // pages
    if (!delta) return;

    const pinch = event.ctrlKey;
    let dz = -delta / (pinch ? 50 : 150);
    if (!pinch) dz = Math.max(-0.75, Math.min(0.75, dz)); // one mouse notch ≈ 0.67

    this.zoomTowards(this.pointFromEvent(event), dz, pinch);
  }

  private zoomTowards(anchor: L.Point, dz: number, immediate: boolean) {
    const map = this.map;
    const base = this.zoomTarget ?? map.getZoom();
    this.zoomTarget = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), base + dz));
    this.zoomAnchor = anchor;
    if (immediate) {
      this.applyZoomStep(1);
      return;
    }
    if (this.zoomFrame === null) this.zoomFrame = requestAnimationFrame(this.zoomLoop);
  }

  private zoomLoop = () => {
    this.zoomFrame = null;
    if (this.disposed) return;
    if (this.applyZoomStep(0.35)) this.zoomFrame = requestAnimationFrame(this.zoomLoop);
  };

  /** Moves the zoom part of the way to the target; returns true if not there yet. */
  private applyZoomStep(ease: number) {
    if (this.zoomTarget === null || !this.zoomAnchor) return false;
    const current = this.map.getZoom();
    let next = current + (this.zoomTarget - current) * ease;
    if (Math.abs(this.zoomTarget - next) < 0.01) next = this.zoomTarget;
    this.map.stop();
    this.map.setZoomAround(this.zoomAnchor, next, { animate: false });
    if (next === this.zoomTarget) {
      this.zoomTarget = null;
      return false;
    }
    return true;
  }

  // Safari reports trackpad pinch as gesture events instead of ctrl+wheel.
  private onGestureStart = (event: Event) => {
    event.preventDefault();
    this.gestureStartZoom = this.map.getZoom();
  };

  private onGestureChange = (event: Event) => {
    event.preventDefault();
    if (!this.wheelZoomEnabled) return;
    const e = event as Event & { scale: number; clientX: number; clientY: number };
    if (!e.scale) return;
    const rect = this.container.getBoundingClientRect();
    const anchor = L.point(e.clientX - rect.left, e.clientY - rect.top);
    this.zoomTarget = null;
    this.zoomTowards(anchor, this.gestureStartZoom + Math.log2(e.scale) - this.map.getZoom(), true);
  };

  private onContextMenu = (event: MouseEvent) => {
    // macOS turns Ctrl+click into a right click.
    if (this.draw || event.ctrlKey) event.preventDefault();
  };

  private onClick = (event: MouseEvent) => {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    const item = this.canvasLayer.hitTest(this.pointFromEvent(event));
    if (item?.onClick) {
      L.DomEvent.stopPropagation(event);
      item.onClick(item, event);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.draw) {
      // SWT: while drawing a line, Alt = thicker, Ctrl = thinner (5 m steps).
      if (event.key === 'Escape') this.finishDraw(false);
      else if (!event.repeat && event.key === 'Alt') this.changeLineThickness(SWT_LINE_THICKNESS_STEP);
      else if (!event.repeat && (event.key === 'Control' || event.key === 'Meta')) {
        this.changeLineThickness(-SWT_LINE_THICKNESS_STEP);
      }
      event.preventDefault();
      return;
    }

    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
    if (this.hovered?.onDelete) {
      const item = this.hovered;
      this.hovered = null;
      item.onDelete?.(item);
      return;
    }
    if (this.hoveredShape?.shape.onDelete) {
      const shape = this.hoveredShape.shape;
      this.hoveredShape = null;
      shape.onDelete?.();
    }
  };

  private bindEvents() {
    this.container.addEventListener('pointerdown', this.onPointerDown, true);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('pointerup', this.onPointerUp);
    this.container.addEventListener('pointercancel', this.onPointerUp);
    this.container.addEventListener('click', this.onClick, true);
    this.container.addEventListener('wheel', this.onWheel, { capture: true, passive: false });
    this.container.addEventListener('contextmenu', this.onContextMenu);
    this.container.addEventListener('gesturestart', this.onGestureStart);
    this.container.addEventListener('gesturechange', this.onGestureChange);
    document.addEventListener('keydown', this.onKeyDown);

    this.map.on('dblclick', (event: L.LeafletMouseEvent) => {
      if (this.canvasLayer.hitTest(event.containerPoint)?.draggable) return;
      this.emit('dblclick', this.latLngToArma(event.latlng), event.originalEvent);
    });
    this.map.on('zoomend', () => this.emit('zoom', this.map.getZoom()));
  }

  dispose() {
    this.disposed = true;
    this.container.removeEventListener('pointerdown', this.onPointerDown, true);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerup', this.onPointerUp);
    this.container.removeEventListener('pointercancel', this.onPointerUp);
    this.container.removeEventListener('click', this.onClick, true);
    this.container.removeEventListener('wheel', this.onWheel, true);
    this.container.removeEventListener('contextmenu', this.onContextMenu);
    this.container.removeEventListener('gesturestart', this.onGestureStart);
    this.container.removeEventListener('gesturechange', this.onGestureChange);
    if (this.zoomFrame !== null) cancelAnimationFrame(this.zoomFrame);
    document.removeEventListener('keydown', this.onKeyDown);
    this.canvasLayer.dispose();
    this.shapes.forEach((layer) => layer.forEach((handle) => this.removeShape(handle)));
    this.shapes.clear();
    if (this.maplibreLayer) this.map.removeLayer(this.maplibreLayer);
    this.map.remove();
    Object.values(this.listeners).forEach((set) => set.clear());
  }
}

const getFontFamily = (element: HTMLElement) => {
  const family = getComputedStyle(element).fontFamily || getComputedStyle(document.body).fontFamily;
  return family || 'Tahoma, sans-serif';
};

export { ArmaMapRenderer };
export type { RendererEvents, DrawnShape };
