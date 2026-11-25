'use client';

import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage } from '@/widgets/content-page';

function LicencePage() {
  return (
    <ContentPage width="md" title={<Localize translationKey="widgets:header:licence" />}>
      <Paper padding="lg" className="leading-relaxed text-white/85">
        <Localize translationKey="pages:licence:textBefore" />{' '}
        <a
          className="text-a3-orange! hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.bohemia.net/community/licenses"
        >
          <Localize translationKey="pages:licence:linkText" />
        </a>
        <Localize translationKey="pages:licence:textAfter" />
      </Paper>
    </ContentPage>
  );
}

export default LicencePage;
