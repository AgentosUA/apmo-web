import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

export const LicencePage = () => {
  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />
      <main className="flex gap-5 flex-wrap items-center max-w-screen-lg w-full mx-auto bg-black/70 p-4 text-white">
        <h1>Licence</h1>

        <div className='mx-auto max-w-screen-sm p-4 bg-black/70 text-white border-neutral-500 border'>
          Arma Plan Maker uses certain Arma 3 materials in accordance with the Bohemia Interactive
          Community Licenses (including the Arma Public License). All Arma 3 content and trademarks
          are the property of Bohemia Interactive. Use of such content is permitted only under the
          terms of the licenses available at https://www.bohemia.net/community/licenses. This
          software is an independent, non-commercial project and is not endorsed by, affiliated
          with, or sponsored by Bohemia Interactive.
        </div>
      </main>
      <Footer />
    </div>
  );
};
