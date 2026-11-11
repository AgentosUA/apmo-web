import dayjs from 'dayjs';
import type { FC, PropsWithChildren, ReactNode } from 'react';

import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

type PostTag = 'release' | 'update' | 'beta';

const TAG_CLASS: Record<PostTag, string> = {
  release: 'bg-a3-orange text-white',
  update: 'bg-marker-west text-white',
  beta: 'bg-white/15 text-white',
};

const PostTagBadge: FC<{ tag: PostTag }> = ({ tag }) => (
  <span
    className={cn(
      'inline-flex items-center h-5 px-2 text-[11px] uppercase font-medium tracking-wider',
      TAG_CLASS[tag]
    )}
  >
    <Localize translationKey={`pages:changelog:tags:${tag}`} />
  </span>
);

/** One changelog entry rendered as a timeline item. Use inside an <ol>. */
const Post: FC<
  PropsWithChildren<{
    id: string;
    title: string;
    version?: string;
    /** ISO date, e.g. 2024-09-05 */
    date: string;
    tag: PostTag;
    isLatest?: boolean;
    imageUrl?: string;
    media?: ReactNode;
    /** e.g. CONTENT_SECTION_CLASS so anchors land below sticky bars */
    sectionClassName?: string;
  }>
> = ({ id, title, version, date, tag, isLatest, imageUrl, media, sectionClassName, children }) => (
  <li id={id} className={cn('relative pl-8 desktop:pl-10', sectionClassName)}>
    {/* timeline dot */}
    <span
      aria-hidden
      className={cn(
        'absolute left-0 top-1 w-[15px] h-[15px] border-2 rotate-45',
        isLatest
          ? 'border-a3-orange bg-a3-orange shadow-[0_0_12px_rgba(161,108,20,0.8)]'
          : 'border-white/50 bg-a3-black/80'
      )}
    />

    <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
      <time dateTime={date} className="text-white/60 tabular-nums">
        {dayjs(date).format('DD.MM.YYYY')}
      </time>
      <PostTagBadge tag={tag} />
      {isLatest && (
        <span className="inline-flex items-center h-5 px-2 text-[11px] uppercase font-medium tracking-wider border border-a3-orange text-a3-orange">
          <Localize translationKey="pages:changelog:latest" />
        </span>
      )}
    </div>

    <Paper as="article" padding="none" className="overflow-hidden">
      <header className="flex items-stretch border-b border-white/15">
        {version && (
          <span className="flex items-center px-3 bg-white/10 text-sm font-medium tabular-nums text-a3-orange whitespace-nowrap">
            v{version}
          </span>
        )}
        <h2 className="px-4 py-2.5 text-base desktop:text-lg font-medium uppercase leading-snug">
          {title}
        </h2>
      </header>

      {media && <div className="bg-black">{media}</div>}
      {!media && imageUrl && (
        <img
          className="w-full max-h-48 desktop:max-h-64 object-cover object-center"
          src={imageUrl}
          alt=""
          loading="lazy"
        />
      )}

      <div
        className={cn(
          'px-4 py-4 desktop:px-5 text-sm desktop:text-base leading-relaxed text-white/85',
          '[&_b]:text-white [&_b]:font-medium [&_p+*]:mt-2 [&_*+p]:mt-3',
          '[&_ul]:mt-2 [&_ul]:pl-5 [&_ul]:list-[square] [&_li]:mt-1 [&_li]:marker:text-a3-orange',
          '[&_a]:text-a3-orange! [&_a:hover]:underline'
        )}
      >
        {children}
      </div>
    </Paper>
  </li>
);

export { Post };
export type { PostTag };
