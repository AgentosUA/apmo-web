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
      <body>{children}</body>
    </html>
  );
}
