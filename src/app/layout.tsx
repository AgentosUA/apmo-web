import type { Metadata } from 'next';

import '@/shared/ui/styles/reset.scss';
import '@/shared/ui/styles/global.scss';

export const metadata: Metadata = {
  title: 'Arma Planner Online: Create your plan for Arma 3!',
  description: 'Create your plan for Arma 3!',
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
