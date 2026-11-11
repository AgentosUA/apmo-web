'use client';

import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage } from '@/widgets/content-page';

function LicencePage() {
  return (
    <ContentPage width="md" title={<Localize translationKey="widgets:header:licence" />}>
      <Paper padding="lg" className="leading-relaxed text-white/85">
        Arma Plan Maker Online (APMO) uses certain Arma 3 materials in accordance with the Bohemia
        Interactive Community Licenses (including the Arma Public License). All Arma 3 content and
        trademarks are the property of Bohemia Interactive. Use of such content is permitted only
        under the terms of the licenses available at{' '}
        <a
          className="text-a3-orange! hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.bohemia.net/community/licenses"
        >
          licences page
        </a>
        . This software is an independent, non-commercial project and is not endorsed by, affiliated
        with, or sponsored by Bohemia Interactive.
      </Paper>
    </ContentPage>
  );
}

export default LicencePage;
