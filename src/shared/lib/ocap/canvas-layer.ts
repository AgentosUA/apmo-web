/**
 * Single-canvas icon + label layer, modelled on OCAP2/web EntityCanvasLayer
 * (ui/src/renderers/leaflet/entityCanvasLayer.ts).
 *
 * Instead of one DOM element per marker (react-leaflet <Marker>), every icon
 * and label is drawn on one <canvas> on top of the Leaflet map:
 *  - Arma → screen projection is a precomputed affine transform (3 reference
 *    points), so there is no per-item LatLng allocation.
 *  - During Leaflet's zoom animation the canvas gets the same CSS
 *    translate+scale transform as Leaflet's panes and icons are counter-scaled.
 *  - Off-screen items are culled.
 *
 * On top of OCAP's read-only playback layer this adds what a planner needs:
 * hit-testing (click, hover, drag) on the drawn icons.
 */
import L from 'leaflet';

import type { ArmaCoord } from './coordinates';
import { iconCache } from './icons';

type LabelStyle = {
  text: string;
  color: string;
  /** CSS font size in px. */
  size?: number;
  weight?: number | string;
  /** 'right' = Arma style, next to the icon; 'center' = centered on the point. */
  align?: 'right' | 'center';
  italic?: boolean;
};

type CanvasItem = {
  id: string;
  x: number;
  y: number;
  /** Degrees, clockwise from north. */
  direction?: number;
  icon?: {
    url: string;
    /** Hex color (no '#') used to tint the icon, or null for native colors. */
    color: string | null;
    size: [number, number];
    /** Rotation origin Y offset as a fraction of height (OCAP "man" icons rotate at 50% 60%). */
    originOffsetY?: number;
  };
  label?: LabelStyle;
  opacity?: number;
  interactive?: boolean;
  draggable?: boolean;
  /** Free-form payload for event handlers. */
  data?: unknown;
  onClick?: (item: CanvasItem, event: MouseEvent) => void;
  onDragEnd?: (item: CanvasItem, position: ArmaCoord) => void;
  /** Alt + drag (SWT): rotate the marker towards the cursor. */
  onRotateEnd?: (item: CanvasItem, direction: number) => void;
  /** Shift + wheel over the marker (SWT size): +1 bigger, -1 smaller. */
  onResize?: (item: CanvasItem, direction: number) => void;
  onDelete?: (item: CanvasItem) => void;
};

type LayerEntry = {
  zIndex: number;
  visible: boolean;
  items: CanvasItem[];
};

type HitBox = {
  item: CanvasItem;
  x: number;
  y: number;
  w: number;
  h: number;
};

type CanvasLayerConfig = {
  armaToLatLng: (coords: ArmaCoord) => L.LatLng;
  fontFamily: string;
};

const CULL_MARGIN = 60;
const MIN_HIT_SIZE = 18;

class CanvasLayer {
  private map: L.Map;
  private config: CanvasLayerConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private layers = new Map<string, LayerEntry>();
  private hitBoxes: HitBox[] = [];

  private zooming = false;
  private zoomScale = 1;
  private drawnCenter: L.LatLng | null = null;
  private drawnZoom = 0;
  private cachedPositions = new Map<CanvasItem, { px: number; py: number }>();

  private proj = { ax: 0, bx: 0, cx: 0, ay: 0, by: 0, cy: 0 };

  /** Live override for an item being dragged. */
  private dragOverride: {
    item: CanvasItem;
    x: number;
    y: number;
    direction?: number;
    settled: boolean;
  } | null = null;

  private frame: number | null = null;
  private resizeObserver: ResizeObserver;
  private unsubscribeIcons: () => void;

  constructor(map: L.Map, config: CanvasLayerConfig) {
    this.map = map;
    this.config = config;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'apmo-canvas-layer';
    // transform-origin 0 0 matches Leaflet's zoom transform math.
    this.canvas.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:625;transform-origin:0 0;';
    this.ctx = this.canvas.getContext('2d')!;
    map.getContainer().appendChild(this.canvas);

    this.resize();
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.requestRender();
    });
    this.resizeObserver.observe(map.getContainer());

    map.on('move', this.requestRender, this);
    map.on('zoomanim', this.onZoomAnim, this);
    map.on('zoomend', this.onZoomEnd, this);
    map.on('resize viewreset', this.requestRender, this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.canvas.addEventListener('transitionend', this.onTransitionEnd);

    this.unsubscribeIcons = iconCache.subscribe(() => this.requestRender());

    this.requestRender();
  }

  // --------------- public API ---------------

  setLayer(key: string, items: CanvasItem[], zIndex = 0) {
    const existing = this.layers.get(key);
    this.layers.set(key, { zIndex: existing?.zIndex ?? zIndex, visible: existing?.visible ?? true, items });
    const dragged = this.dragOverride?.item.id;
    if (dragged && this.dragOverride?.settled && items.some((item) => item.id === dragged && item !== this.dragOverride?.item)) {
      this.dragOverride = null;
    }
    this.requestRender();
  }

  removeLayer(key: string) {
    this.layers.delete(key);
    this.requestRender();
  }

  setLayerVisible(key: string, visible: boolean) {
    const layer = this.layers.get(key);
    if (!layer) return;
    layer.visible = visible;
    this.requestRender();
  }

  /**
   * Draw `item` at `position` instead of its own coordinates (live dragging).
   * A `settled` override (after drop) is dropped as soon as fresh items with
   * the same id arrive via setLayer().
   */
  setDragOverride(item: CanvasItem | null, position?: ArmaCoord, settled = false, direction?: number) {
    this.dragOverride = item && position ? { item, x: position[0], y: position[1], direction, settled } : null;
    this.requestRender();
  }

  /** Topmost interactive item under a container point. */
  hitTest(point: L.Point): CanvasItem | null {
    for (let i = this.hitBoxes.length - 1; i >= 0; i--) {
      const box = this.hitBoxes[i];
      if (point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h) {
        return box.item;
      }
    }
    return null;
  }

  requestRender() {
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.render();
    });
  }

  dispose() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.map.off('move', this.requestRender, this);
    this.map.off('zoomanim', this.onZoomAnim, this);
    this.map.off('zoomend', this.onZoomEnd, this);
    this.map.off('resize viewreset', this.requestRender, this);
    this.canvas.removeEventListener('transitionend', this.onTransitionEnd);
    this.resizeObserver.disconnect();
    this.unsubscribeIcons();
    this.canvas.remove();
    this.layers.clear();
    this.hitBoxes = [];
  }

  // --------------- zoom animation (OCAP) ---------------

  private onZoomAnim(event: L.ZoomAnimEvent) {
    if (!this.drawnCenter) return;
    const scale = this.map.getZoomScale(event.zoom, this.drawnZoom);
    const viewHalf = this.map.getSize().multiplyBy(0.5);
    const currentCenterPoint = this.map.project(this.drawnCenter, event.zoom);
    const destCenterPoint = this.map.project(event.center, event.zoom);
    const centerOffset = destCenterPoint.subtract(currentCenterPoint);
    const offset = viewHalf.multiplyBy(-scale).add(viewHalf).subtract(centerOffset);

    this.zoomScale = scale;
    this.zooming = true;
    this.canvas.style.transition = 'transform 0.25s cubic-bezier(0,0,0.25,1)';
    this.canvas.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`;
    // Redraw once with counter-scaled icons at cached positions.
    this.render();
  }

  private onTransitionEnd() {
    this.finishZoom();
  }

  private onZoomEnd() {
    this.finishZoom();
  }

  private finishZoom() {
    if (!this.zooming && !this.canvas.style.transform) {
      this.requestRender();
      return;
    }
    this.canvas.style.transition = '';
    this.canvas.style.transform = '';
    this.zooming = false;
    this.zoomScale = 1;
    this.render();
  }

  // --------------- rendering ---------------

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const container = this.map.getContainer();
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.dpr = dpr;
  }

  private updateProjection() {
    const d = 10000;
    const p0 = this.map.latLngToContainerPoint(this.config.armaToLatLng([0, 0]));
    const p1 = this.map.latLngToContainerPoint(this.config.armaToLatLng([d, 0]));
    const p2 = this.map.latLngToContainerPoint(this.config.armaToLatLng([0, d]));
    this.proj = {
      ax: (p1.x - p0.x) / d,
      bx: (p2.x - p0.x) / d,
      cx: p0.x,
      ay: (p1.y - p0.y) / d,
      by: (p2.y - p0.y) / d,
      cy: p0.y,
    };
  }

  private render() {
    const ctx = this.ctx;
    const dpr = this.dpr;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (!this.zooming) this.updateProjection();

    // Counter-scale during the CSS zoom transform so icons/text keep their pixel size.
    const cs = this.zooming ? 1 / this.zoomScale : 1;
    const hitBoxes: HitBox[] = [];
    const layers = [...this.layers.values()].filter((l) => l.visible).sort((a, b) => a.zIndex - b.zIndex);
    const positions = this.zooming ? this.cachedPositions : new Map<CanvasItem, { px: number; py: number }>();
    const directions = new Map<CanvasItem, number>();

    for (const layer of layers) {
      for (const item of layer.items) {
        let px: number;
        let py: number;

        if (this.zooming) {
          const cached = positions.get(item);
          if (!cached) continue;
          px = cached.px;
          py = cached.py;
        } else {
          const override = this.dragOverride?.item.id === item.id ? this.dragOverride : null;
          const x = override ? override.x : item.x;
          const y = override ? override.y : item.y;
          if (override?.direction !== undefined) directions.set(item, override.direction);
          px = this.proj.ax * x + this.proj.bx * y + this.proj.cx;
          py = this.proj.ay * x + this.proj.by * y + this.proj.cy;
          positions.set(item, { px, py });
        }

        if (px < -CULL_MARGIN * 4 || px > w + CULL_MARGIN * 4 || py < -CULL_MARGIN || py > h + CULL_MARGIN) {
          continue;
        }

        const box = this.drawItem(item, px, py, cs, directions.get(item));
        if (box && (item.interactive || item.draggable)) hitBoxes.push(box);
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;

    if (!this.zooming) {
      this.hitBoxes = hitBoxes;
      this.drawnCenter = this.map.getCenter();
      this.drawnZoom = this.map.getZoom();
      this.cachedPositions = positions;
    }
  }

  private drawItem(item: CanvasItem, px: number, py: number, cs: number, directionOverride?: number): HitBox | null {
    const ctx = this.ctx;
    const dpr = this.dpr;
    const opacity = item.opacity ?? 1;
    if (opacity <= 0) return null;

    let iconW = 0;
    let iconH = 0;

    if (item.icon) {
      [iconW, iconH] = item.icon.size;
      iconW *= cs;
      iconH *= cs;
      const img = iconCache.get(item.icon.url, item.icon.color);

      if (img) {
        const offy = (item.icon.originOffsetY ?? 0) * iconH;
        const rad = ((directionOverride ?? item.direction ?? 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * px, dpr * py);
        ctx.globalAlpha = opacity;
        // Keep the image aspect ratio inside the icon box (e.g. 2:1 flag textures).
        const ratio = img.width / img.height || 1;
        const dw = ratio >= iconW / iconH ? iconW : iconH * ratio;
        const dh = ratio >= iconW / iconH ? iconW / ratio : iconH;
        ctx.drawImage(img, -dw / 2, -dh / 2 - offy, dw, dh);
      }
    }

    let labelBox: { x: number; y: number; w: number; h: number } | null = null;

    if (item.label?.text) {
      labelBox = this.drawLabel(item.label, px, py, iconW, cs, opacity);
    }

    if (!item.icon && !labelBox) return null;

    if (item.icon) {
      const hw = Math.max(iconW, MIN_HIT_SIZE) / 2;
      const hh = Math.max(iconH, MIN_HIT_SIZE) / 2;
      return { item, x: px - hw, y: py - hh, w: hw * 2, h: hh * 2 };
    }

    return labelBox ? { item, ...labelBox } : null;
  }

  private drawLabel(label: LabelStyle, px: number, py: number, iconW: number, cs: number, opacity: number) {
    const ctx = this.ctx;
    const dpr = this.dpr;
    const size = Math.round((label.size ?? 13) * cs);
    const weight = label.weight ?? 500;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.font = `${label.italic ? 'italic ' : ''}${weight} ${size}px ${this.config.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const align = label.align ?? 'right';
    ctx.textAlign = align === 'center' ? 'center' : 'left';
    const tx = align === 'center' ? px : px + iconW / 2 + 3 * cs;

    // Halo for readability on any terrain (dark halo for light text and vice versa).
    const isDark = isDarkColor(label.color);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 3 * cs;
    ctx.strokeText(label.text, tx, py);
    ctx.fillStyle = label.color;
    ctx.fillText(label.text, tx, py);

    const width = ctx.measureText(label.text).width;
    return {
      x: align === 'center' ? tx - width / 2 : tx,
      y: py - size / 2,
      w: width,
      h: size,
    };
  }
}

const isDarkColor = (color: string) => {
  const hex = color.replace('#', '');
  if (hex.length < 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
};

export { CanvasLayer };
export type { CanvasItem, LabelStyle };
