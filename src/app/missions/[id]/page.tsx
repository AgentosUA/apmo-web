'use client';

import dynamic from 'next/dynamic';

import { useMounted } from '@/shared/ui/hooks/use-mounted';

import { Overlay } from '@/shared/ui/atoms/overlay';

import styles from './page.module.scss';

const MyAwesomeMap = dynamic(() => import('@/shared/ui/atoms/map/ui'), {
  ssr: false,
});

export default function Page() {
  const isMounted = useMounted();

  if (!isMounted) return <h2>loading</h2>;

  return (
    <main className={styles.main}>
      <Overlay.Header title='untitled plan' />
      <Overlay.Menu />

      <MyAwesomeMap />
    </main>
  );
}
