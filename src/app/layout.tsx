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
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
