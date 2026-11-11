/**
 * Marker / entity icon loading and coloring for canvas rendering.
 *
 * - PNG markers are tinted exactly like OCAP2/web `paintPNG()`
 *   (internal/server/marker.go): every pixel is converted to CMYK and each
 *   channel is max()-ed with the target color, then converted back. White
 *   artwork becomes the target color, black outlines stay black.
 * - SVG markers from OCAP (`man.svg`, `car.svg`, …) are Go templates with a
 *   `{{.}}` placeholder for the RRGGBBAA fill, like `paintSVG()`.
 *
 * OCAP does this on the server; we do it once per (icon, color) in the browser
 * and cache the result as a canvas, so thousands of markers draw with a single
 * `drawImage` each.
 */
import { markerAssets } from '@/shared/data/marker-assets';

const MARKERS_PATH = '/markers';
const FALLBACK_MARKER = 'mil_unknown';
/** Rasterization size for SVG / tinted icons (2× the largest draw size). */
const RASTER_SIZE = 96;

type IconSource = HTMLCanvasElement;

/** Resolve an Arma marker class name to an image URL (case-insensitive). */
const resolveMarkerUrl = (markerType?: string | null) => {
  const key = (markerType ?? '').toLowerCase();
  const file = markerAssets[key] ?? markerAssets[FALLBACK_MARKER];
  return `${MARKERS_PATH}/${file}`;
};

const hasMarkerAsset = (markerType?: string | null) =>
  Boolean(markerAssets[(markerType ?? '').toLowerCase()]);

// --------------- color math (Go image/color CMYK model) ---------------

const rgbToCmyk = (r: number, g: number, b: number): [number, number, number, number] => {
  const w = Math.max(r, g, b);
  if (w === 0) return [0, 0, 0, 255];
  return [((w - r) * 255) / w, ((w - g) * 255) / w, ((w - b) * 255) / w, 255 - w];
};

const cmykToRgb = (c: number, m: number, y: number, k: number): [number, number, number] => {
  const w = 255 - k;
  return [((255 - c) * w) / 255, ((255 - m) * w) / 255, ((255 - y) * w) / 255];
};

const hexToRgb = (hex: string): [number, number, number] => {
  const value = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const paintPixels = (data: Uint8ClampedArray, hex: string) => {
  const [tc, tm, ty, tk] = rgbToCmyk(...hexToRgb(hex));

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    // Go's color.CMYKModel converts from alpha-premultiplied RGBA.
    const f = a / 255;
    const [c, m, y, k] = rgbToCmyk(data[i] * f, data[i + 1] * f, data[i + 2] * f);
    const [r, g, b] = cmykToRgb(
      Math.max(tc, c),
      Math.max(tm, m),
      Math.max(ty, y),
      Math.max(tk, k)
    );
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
};

// --------------- loading ---------------

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });

const svgTextCache = new Map<string, Promise<string>>();

const loadSvgText = (url: string) => {
  let promise = svgTextCache.get(url);
  if (!promise) {
    promise = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      return response.text();
    });
    svgTextCache.set(url, promise);
  }
  return promise;
};

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
};

const rasterize = (img: HTMLImageElement, maxSize = RASTER_SIZE) => {
  const w = img.naturalWidth || maxSize;
  const h = img.naturalHeight || maxSize;
  const scale = Math.min(1, maxSize / Math.max(w, h));
  const canvas = createCanvas(w * scale, h * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const buildIcon = async (url: string, color: string | null): Promise<IconSource> => {
  if (url.toLowerCase().endsWith('.svg')) {
    const text = await loadSvgText(url);

    if (text.includes('{{.}}')) {
      // OCAP template: fill="#{{.}}" expects RRGGBBAA.
      const fill = `${color ?? '000000'}ff`;
      const svg = text.replaceAll('{{.}}', fill);
      const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      try {
        return rasterize(await loadImage(blobUrl));
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }

  const canvas = rasterize(await loadImage(url), url.endsWith('.svg') ? RASTER_SIZE : 128);

  if (color && !url.toLowerCase().endsWith('.svg')) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    paintPixels(image.data, color);
    ctx.putImageData(image, 0, 0);
  }

  return canvas;
};

// --------------- cache ---------------

type Listener = () => void;

/**
 * Global cache of painted icons. `get()` is synchronous and returns `null`
 * until the icon is ready; subscribers are notified when new icons load so
 * the canvas can redraw.
 */
class IconCache {
  private ready = new Map<string, IconSource>();
  private pending = new Map<string, Promise<IconSource | null>>();
  private failed = new Set<string>();
  private listeners = new Set<Listener>();
  private notifyScheduled = false;

  private key(url: string, color: string | null) {
    return `${url}|${color ?? ''}`;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    requestAnimationFrame(() => {
      this.notifyScheduled = false;
      this.listeners.forEach((listener) => listener());
    });
  }

  load(url: string, color: string | null): Promise<IconSource | null> {
    const key = this.key(url, color);
    const ready = this.ready.get(key);
    if (ready) return Promise.resolve(ready);
    if (this.failed.has(key)) return Promise.resolve(null);

    let promise = this.pending.get(key);
    if (!promise) {
      promise = buildIcon(url, color)
        .then((icon) => {
          this.ready.set(key, icon);
          this.notify();
          return icon;
        })
        .catch(() => {
          this.failed.add(key);
          return null;
        })
        .finally(() => this.pending.delete(key));
      this.pending.set(key, promise);
    }
    return promise;
  }

  get(url: string, color: string | null): IconSource | null {
    const icon = this.ready.get(this.key(url, color));
    if (icon) return icon;
    void this.load(url, color);
    return null;
  }

  /** Data URL of a painted icon, for use in regular <img> tags (marker palette). */
  async toDataUrl(url: string, color: string | null) {
    const icon = await this.load(url, color);
    return icon ? icon.toDataURL('image/png') : null;
  }
}

const iconCache = new IconCache();

export { iconCache, resolveMarkerUrl, hasMarkerAsset, paintPixels };
export type { IconSource };
