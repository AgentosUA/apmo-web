import type { Metadata } from 'next';

import { Roboto_Condensed } from 'next/font/google';

import '@/shared/ui/styles/reset.scss';
import '@/shared/ui/styles/global.scss';
import { Toaster } from '@/shared/ui/organisms/toaster';

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
      </head>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
