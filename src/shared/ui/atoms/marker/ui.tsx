'use client';

import { FC, memo, useEffect, useState } from 'react';

import { resolveMarkerColor } from '@/shared/lib/ocap/colors';
import { iconCache, resolveMarkerUrl } from '@/shared/lib/ocap/icons';

type LocationType =
  | 'city'
  | 'village'
  | 'local'
  | 'rockarea'
  | 'hill'
  | 'marine';

type Location = [LocationType, string, number, number];

/**
 * Marker icon for regular DOM UI (marker palette etc.), painted with the same
 * OCAP coloring as the map canvas so the palette matches what you get.
 */
const MarkerIconComponent: FC<{
  markerName: string;
  /** Arma color name, e.g. "ColorRed". */
  color: string;
  className?: string;
  width?: number | string;
  height?: number;
  onClick?: () => void;
}> = memo(({ markerName, color, className, width = 32, height = 32, onClick }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = resolveMarkerUrl(markerName);
    const tint = resolveMarkerColor(color, markerName);

    iconCache.toDataUrl(url, tint).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl ?? url);
    });

    return () => {
      cancelled = true;
    };
  }, [markerName, color]);

  return (
    <span
      className={className}
      style={{ display: 'block', width: Number(width), height }}
      onClick={onClick}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={Number(width)} height={height} alt={markerName} draggable={false} />
      )}
    </span>
  );
});

MarkerIconComponent.displayName = 'MarkerIconComponent';

export { MarkerIconComponent };

export type { Location, LocationType };
