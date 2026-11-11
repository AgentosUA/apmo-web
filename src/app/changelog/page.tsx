'use client';

import dayjs from 'dayjs';
import Link from 'next/link';

import { Post, type PostTag } from '@/entities/post/ui';
import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage, CONTENT_SECTION_CLASS } from '@/widgets/content-page';

const ISSUES_URL = 'https://github.com/AgentosUA/apmo-web/issues';

const ReportBugs = () => (
  <p>
    During the usage of APMO you may occur some bugs, so feel free to inform us on{' '}
    <Link href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
      GitHub issues
    </Link>
    .
  </p>
);

type Entry = {
  id: string;
  version?: string;
  title: string;
  date: string;
  tag: PostTag;
  imageUrl?: string;
  media?: React.ReactNode;
  content?: React.ReactNode;
};

/** Newest first. Dates are ISO (YYYY-MM-DD). */
const ENTRIES: Entry[] = [
  {
    id: 'v1-0-0-rc1',
    version: '1.0.0-RC1',
    title: 'Version release',
    date: '2024-09-05',
    tag: 'release',
    media: (
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/rR1S-dNhvOo?si=adyZ3wh_Yv3fMXwy"
          title="APMO 1.0.0-RC1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
    ),
  },
  {
    id: 'update-2024-06-20',
    title: 'New maps & marker support',
    date: '2024-06-20',
    tag: 'update',
    imageUrl: '/preview.jpg',
    content: (
      <>
        <p>List of changes:</p>
        <ul>
          <li>
            The display of linear and rectangular zone markers has been added in the test mode
          </li>
          <li>Map load & move optimization (1 layer instead of 7)</li>
          <li>
            <b>New maps:</b> Korsac, Farabad, Isla Pera, Hellanmaa, Kunduz River, North Takistan,
            Livonia
          </li>
        </ul>
        <ReportBugs />
      </>
    ),
  },
  {
    id: 'beta-2024-05-11',
    title: 'APMO Beta Release [MVP]',
    date: '2024-05-11',
    tag: 'beta',
    imageUrl: '/preview.jpg',
    content: (
      <>
        <p>
          <b>Welcome to APMO: Arma Plan Maker Online!</b>
        </p>
        <p>We are happy to inform you that our project is now open for beta testing!</p>
        <p>
          While working on the 1.0 release version, some features are already available for you:
        </p>
        <ul>
          <li>Select one of 40 maps for your plan</li>
          <li>
            Upload any .pbo mission from Arma 3, view briefing, slots, vehicles & custom structures
          </li>
          <li>Copy & Paste SWT markers from Arma 3</li>
          <li>Move/Create/Delete basic SWT Markers</li>
          <li>Save plans & share it with your team</li>
        </ul>
        <ReportBugs />
      </>
    ),
  },
];

const NAV = ENTRIES.map((entry) => ({
  id: entry.id,
  label: entry.version ? `v${entry.version}` : dayjs(entry.date).format('DD.MM.YYYY'),
  hint: entry.title,
}));

const ChangelogPage = () => (
  <ContentPage
    title={<Localize translationKey="pages:changelog:title" />}
    subtitle={<Localize translationKey="pages:changelog:subtitle" />}
    titleAside={
      <Paper padding="none" className="px-3 py-1.5 text-sm text-white/70">
        <Localize translationKey="pages:changelog:currentVersion" />:{' '}
        <span className="text-a3-orange font-medium tabular-nums">v{process.env.APP_VERSION}</span>
      </Paper>
    }
    nav={NAV}
    navTitle={<Localize translationKey="pages:changelog:versions" />}
  >
    <ol className="relative flex flex-col gap-10 before:absolute before:left-[7px] before:top-3 before:bottom-0 before:w-px before:bg-linear-to-b before:from-a3-orange/70 before:via-white/20 before:to-transparent">
      {ENTRIES.map(({ content, ...entry }, index) => (
        <Post
          key={entry.id}
          {...entry}
          isLatest={index === 0}
          sectionClassName={CONTENT_SECTION_CLASS}
        >
          {content}
        </Post>
      ))}
    </ol>
  </ContentPage>
);

export default ChangelogPage;
