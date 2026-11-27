import { cn } from '@/shared/utils/cn';

/** Small outlined badge with the current app version, e.g. "v2.0.0". */
const VersionBadge = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center h-4 px-1.5 text-[10px] leading-none font-medium tabular-nums tracking-wider',
      'text-a3-orange border border-a3-orange/70 bg-black/60',
      className
    )}
  >
    v{process.env.APP_VERSION}
  </span>
);

export { VersionBadge };
