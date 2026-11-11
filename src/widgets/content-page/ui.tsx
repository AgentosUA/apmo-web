'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

type ContentNavItem = {
  /** Section id (anchor target) or a unique key when `href` is set. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Route link instead of an in-page anchor. */
  href?: string;
};

type ContentPageProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered on the right side of the title row (badges, actions…). */
  titleAside?: ReactNode;
  /** Back link above the title. Defaults to the home page; `false` hides it. */
  back?: { href: string; label: ReactNode } | false;
  /** Side navigation (desktop) / sticky chip bar (mobile). */
  nav?: ContentNavItem[];
  navTitle?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

/** Add to sections targeted by `nav` anchors so they aren't hidden under the sticky header / chip bar. */
const CONTENT_SECTION_CLASS = 'scroll-mt-40 desktop:scroll-mt-32';

const WIDTH_CLASS: Record<NonNullable<ContentPageProps['width']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
};

/** Tracks which anchored section is currently in view. */
const useActiveSection = (ids: string[]) => {
  const [activeId, setActiveId] = useState(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        });

        // At the very bottom the last section may never reach the observed band.
        const isAtBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (isAtBottom) {
          setActiveId(ids[ids.length - 1]);
          return;
        }

        const topmost = ids.find((id) => visible.has(id));
        if (topmost) setActiveId(topmost);
      },
      { rootMargin: '-25% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return activeId;
};

const ContentNav = ({ items, title }: { items: ContentNavItem[]; title?: ReactNode }) => {
  const pathname = usePathname();
  const activeSection = useActiveSection(items.filter((i) => !i.href).map((i) => i.id));
  const chipsRef = useRef<HTMLDivElement>(null);

  const isActive = (item: ContentNavItem) =>
    item.href ? pathname === item.href : activeSection === item.id;

  // Keep the active chip visible in the horizontal mobile bar.
  useEffect(() => {
    const container = chipsRef.current;
    const chip = container?.querySelector<HTMLElement>('[data-active="true"]');
    if (!container || !chip) return;

    container.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
  }, [activeSection, pathname]);

  const getHref = (item: ContentNavItem) => item.href ?? `#${item.id}`;

  return (
    <>
      {/* Mobile: sticky horizontal chips */}
      <Paper
        as="nav"
        padding="none"
        aria-label="Sections"
        className="desktop:hidden sticky top-20 z-10 -mx-4 border-x-0"
      >
        <div
          ref={chipsRef}
          className="flex gap-2 px-4 py-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const active = isActive(item);

            return (
              <Link
                key={item.id}
                href={getHref(item)}
                data-active={active}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'shrink-0 h-8 px-3 flex items-center text-xs uppercase tracking-wide border transition-colors whitespace-nowrap',
                  active
                    ? 'border-a3-orange bg-a3-orange/25 text-white!'
                    : 'border-white/20 text-white/75! hover:border-white/50'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </Paper>

      {/* Desktop: sticky side list */}
      <aside className="hidden desktop:block">
        <nav className="sticky top-32" aria-label="Sections">
          {title && <p className="mb-3 text-xs uppercase tracking-widest text-white/50">{title}</p>}
          <Paper as="div" padding="none" className="py-1">
            <ul className="flex flex-col">
              {items.map((item) => {
                const active = isActive(item);

                return (
                  <li key={item.id}>
                    <Link
                      href={getHref(item)}
                      aria-current={active ? 'location' : undefined}
                      className={cn(
                        'group flex flex-col pl-4 pr-3 py-2 border-l-2 transition-colors',
                        active
                          ? 'border-a3-orange bg-a3-orange/15'
                          : 'border-transparent hover:border-white/40 hover:bg-white/5'
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm tabular-nums',
                          active
                            ? 'text-a3-orange font-medium'
                            : 'text-white group-hover:text-white'
                        )}
                      >
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="text-xs text-white/50 truncate">{item.hint}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Paper>
        </nav>
      </aside>
    </>
  );
};

/**
 * Shared shell for content pages: header, back link, title block, optional section nav, footer.
 */
const ContentPage = ({
  title,
  subtitle,
  titleAside,
  back,
  nav,
  navTitle,
  width = 'md',
  className,
  children,
}: ContentPageProps) => {
  const backLink =
    back === false
      ? null
      : (back ?? { href: '/', label: <Localize translationKey="pages:changelog:backToHome" /> });

  const hasNav = Boolean(nav?.length);

  return (
    <div className="flex flex-col min-h-screen min-h-svh">
      <Header />

      <div
        className={cn(
          'w-full mx-auto px-4 pt-6 pb-12 desktop:pt-10',
          hasNav ? WIDTH_CLASS.lg : WIDTH_CLASS[width]
        )}
      >
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 mb-5 text-sm uppercase text-white/70! hover:text-white! transition-colors"
          >
            <FiArrowLeft aria-hidden />
            {backLink.label}
          </Link>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6 desktop:mb-8 pb-4 border-b border-white/15">
          <div className="border-l-4 border-a3-orange pl-4">
            <h1 className="text-2xl desktop:text-4xl font-medium uppercase text-white tracking-wide">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm desktop:text-base text-white/60">{subtitle}</p>}
          </div>
          {titleAside}
        </div>

        {hasNav ? (
          <div className="grid gap-6 desktop:gap-8 desktop:grid-cols-[220px_minmax(0,1fr)]">
            <ContentNav items={nav!} title={navTitle} />
            <div className={className}>{children}</div>
          </div>
        ) : (
          <div className={className}>{children}</div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export { ContentPage, CONTENT_SECTION_CLASS };
export type { ContentNavItem, ContentPageProps };
