import type { Metadata } from 'next';

import './globals.scss';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Arma Planner Online',
  description: 'Create your plan for Arma 3 SG online',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <Head>
        <link
          href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.css'
          type='text/css'
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
