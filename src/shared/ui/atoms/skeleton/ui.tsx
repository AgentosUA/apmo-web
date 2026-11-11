import { FC, HTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

/** Placeholder block shown while content is loading. Size it with className. */
const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    aria-hidden
    className={cn('relative overflow-hidden bg-white/10 animate-skeleton', className)}
    {...props}
  />
);

export { Skeleton };
