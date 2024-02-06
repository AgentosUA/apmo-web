import type { Metadata } from 'next';

import Head from 'next/head';

// import 'leaflet/dist/leaflet.css';
import './globals.scss';

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
          rel='stylesheet'
          href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          type='text/css'
          integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          crossorigin=''
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
