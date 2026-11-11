'use client';

import { FC, useEffect, useMemo, useState } from 'react';

import { getWorldPreviewCandidates } from '@/shared/lib/ocap/worlds';

/**
 * Map preview image: tries the OCAP preview first, then the legacy local
 * preview, then a placeholder.
 */
const WorldPreview: FC<{
  worldName?: string | null;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}> = ({ worldName, className, width, height, alt = 'map preview' }) => {
  const candidates = useMemo(() => getWorldPreviewCandidates(worldName), [worldName]);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [candidates]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={candidates[Math.min(index, candidates.length - 1)]}
      width={width}
      height={height}
      alt={alt}
      loading="lazy"
      onError={() => setIndex((current) => (current < candidates.length - 1 ? current + 1 : current))}
    />
  );
};

export { WorldPreview };
