'use client';

import { observer } from 'mobx-react-lite';

import { ArmaMap } from '@/widgets/arma-map';
import { MapSelection } from '@/widgets/map-selection';
import { mapsEntity } from '@/entities/maps';

import styles from './page.module.scss';

import { NewMissionOverlay } from '@/widgets/new-map-overlay';

const CreateMissionPage = observer(() => {
  if (!mapsEntity.selectedMap) {
    return (
      <main className={styles.main}>
        <MapSelection />
      </main>
    );
  }

  return (
    <>
      <ArmaMap />
      <NewMissionOverlay />
    </>
  );
});

export default CreateMissionPage;
