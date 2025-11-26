'use client';

import Link from 'next/link';

import { Button } from '@/shared/ui/atoms/button';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

function LicencePage() {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />
      <main className="flex flex-col w-full mx-auto max-w-screen-sm my-auto">
        <Link className="w-fit mb-2" href="/">
          <Button>
            <Localize translationKey="pages:changelog:backToHome" />
          </Button>
        </Link>
        <div className="mx-auto max-w-screen-sm p-4 paper text-white">
          <h1 className="text-2xl font-bold mb-4">Licence</h1>
          Arma Plan Maker Online (APMO) uses certain Arma 3 materials in accordance with the Bohemia
          Interactive Community Licenses (including the Arma Public License). All Arma 3 content and
          trademarks are the property of Bohemia Interactive. Use of such content is permitted only
          under the terms of the licenses available at{' '}
          <a
            className="text-a3-orange"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.bohemia.net/community/licenses"
          >
            licences page
          </a>
          . This software is an independent, non-commercial project and is not endorsed by,
          affiliated with, or sponsored by Bohemia Interactive.
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LicencePage;
