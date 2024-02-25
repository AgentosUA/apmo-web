import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay } from '@/shared/ui/atoms/overlay';
import { DateClock } from '@/shared/ui/moleculas/date-clock/ui';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { View } from '@/shared/ui/quarks/view';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import styles from './ui.module.scss';

const NewMissionOverlay = observer(() => {
  if (!mapsEntity.selectedMap) return null;

  const [active, setActive] = useState({
    map: true,
    markers: false,
  });

  const onCofrimClearMarkers = () => {
    markersEntity.clearMarkers();
    toasterEntity.callToaster({
      title: 'Markers cleared',
      description: 'All markers have been removed',
    });
  };

  return (
    <>
      <Overlay.Header
        title={mapsEntity.selectedMap.name}
        onBack={mapsEntity.unselectMap}
        rightCorner={<DateClock className={styles.clock} />}
      />
      <Overlay.MenuWrapper>
        <Overlay.Menu>
          <Overlay.MenuItem
            isActive={active.map}
            onClick={() =>
              setActive({
                ...active,
                markers: false,
                map: true,
              })
            }>
            Map
          </Overlay.MenuItem>
          {/* <Overlay.MenuItem>Guide</Overlay.MenuItem> */}
          <Overlay.MenuItem
            isActive={active.markers}
            onClick={() =>
              setActive({
                ...active,
                map: false,
                markers: true,
              })
            }>
            Markers
          </Overlay.MenuItem>
        </Overlay.Menu>

        <View.Condition if={active.markers}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={markersEntity.SWTMarkerFromClipboard}>
              Load Markers
            </Overlay.MenuItem>
            <Overlay.MenuItem onClick={markersEntity.SWTMarkerToClipboard}>
              Copy Markers
            </Overlay.MenuItem>
            <Modal
              title='Clear all markers'
              description='Are you sure to clear all markers from the map?'
              onConfirm={onCofrimClearMarkers}
              onCancel
              trigger={<Overlay.MenuItem>Clear Markers</Overlay.MenuItem>}
            />
          </Overlay.Menu>
        </View.Condition>
      </Overlay.MenuWrapper>
    </>
  );
});

export { NewMissionOverlay };
