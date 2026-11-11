import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/cn';

const PALETTE = [
  '#B5651D',
  '#4F7942',
  '#3B6EA5',
  '#8E4585',
  '#A23B3B',
  '#5F6B73',
  '#2E8B87',
  '#9C7A1C',
];

/** Stable color per name, for avatars without an image. */
const colorOf = (name: string) => {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }

  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const initialsOf = (name: string) =>
  name.replace(/#.*$/, '').trim().slice(0, 2).toUpperCase() || '?';

type AvatarProps = {
  name: string;
  src?: string | null;
  /** px */
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/** Round avatar: the image, or initials on a color derived from the name. */
const Avatar = ({ name, src, size = 24, className, style }: AvatarProps) => (
  <span
    className={cn(
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full select-none',
      'text-white font-medium leading-none',
      className
    )}
    style={{
      width: size,
      height: size,
      fontSize: Math.max(9, Math.round(size * 0.4)),
      backgroundColor: src ? '#111' : colorOf(name),
      ...style,
    }}
  >
    {src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
    ) : (
      initialsOf(name)
    )}
  </span>
);

export { Avatar };
