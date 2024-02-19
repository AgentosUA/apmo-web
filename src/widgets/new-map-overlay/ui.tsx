import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay } from '@/shared/ui/atoms/overlay';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { View } from '@/shared/ui/quarks/view';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

const NewMissionOverlay = observer(() => {
  if (!mapsEntity.selectedMap) return null;

  const [active, setActive] = useState({
    map: true,
    markers: false,
  });

  return (
    <>
      <Overlay.Header
        title={mapsEntity.selectedMap.name}
        onBack={mapsEntity.unselectMap}
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
              onConfirm={markersEntity.clearMarkers}
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
