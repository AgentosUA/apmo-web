'use client';

import styles from './page.module.scss';

import { MapSelection } from '@/widgets/map-selection';

export default function CreateMission() {
  return (
    <main className={styles.main}>
      <MapSelection />
    </main>
  );
}
