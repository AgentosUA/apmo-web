import type { Metadata } from 'next';

import { Roboto_Condensed } from 'next/font/google';

import '@/shared/ui/styles/reset.scss';
import '@/shared/ui/styles/global.scss';
import { Toaster } from '@/shared/ui/organisms/toaster';
import { useEffect } from 'react';
import { BootProvider } from '@/widgets/boot';

const roboto = Roboto_Condensed({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
  style: 'normal',
  preload: true,
  weight: ['100', '300', '400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arma Plan Maker Online: Create your plan for Arma 3!',
  description: 'Create your plan for Arma 3!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={roboto.variable}>
      <head>
        <link
          rel='apple-touch-icon'
          sizes='120x120'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#000000' />
        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta name='theme-color' content='#ffffff' />
        {/* <!-- Primary Meta Tags --> */}
        <title>Arma Plan Maker Online: Create your plan for Arma 3!</title>
        <meta
          name='title'
          content='Arma Plan Maker Online: Create your plan for Arma 3!'
        />
        <meta name='description' content='Create your plan for Arma 3!' />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://arma-plan-maker.com' />
        <meta
          property='og:title'
          content='Arma Plan Maker Online: Create your plan for Arma 3!'
        />
        <meta
          property='og:description'
          content='Create your plan for Arma 3!'
        />
        <meta property='og:image' content='/preview.jpg' />

        {/* <!-- Twitter --> */}
        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:url' content='/preview.jpg' />
        <meta
          property='twitter:title'
          content='Arma Plan Maker Online: Create your plan for Arma 3!'
        />
        <meta
          property='twitter:description'
          content='Create your plan for Arma 3!'
        />
        <meta property='twitter:image' content='/preview.jpg' />
      </head>
      <body>
        <Toaster />
        <BootProvider>{children}</BootProvider>
      </body>
    </html>
  );
}
