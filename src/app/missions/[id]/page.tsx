'use client';

import { useMounted } from '@/shared/ui/hooks/use-mounted';

import { Overlay } from '@/shared/ui/atoms/overlay';

import styles from './page.module.scss';
import { DateClock } from '@/shared/ui/moleculas/date-clock/ui';

export default function Page() {
  const isMounted = useMounted();

  if (!isMounted) return <h2>loading</h2>;

  return (
    <main className={styles.main}>
      <Overlay.Header
        title='untitled plan'
        rightCorner={
          <div>
            <DateClock />
          </div>
        }
      />
      <Overlay.Menu />

      {/* <ArmaMap selectedMap={} /> */}
    </main>
  );
}
