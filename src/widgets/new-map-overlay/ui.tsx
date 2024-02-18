import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay } from '@/shared/ui/atoms/overlay';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { observer } from 'mobx-react-lite';

const NewMissionOverlay = observer(() => {
  if (!mapsEntity.selectedMap) return null;

  return (
    <>
      <Overlay.Header
        title={mapsEntity.selectedMap.name}
        onBack={mapsEntity.unselectMap}
      />
      <Overlay.Menu>
        <Overlay.MenuItem isActive>Map</Overlay.MenuItem>
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
        {/* <Overlay.MenuItem>Save plan</Overlay.MenuItem> */}
      </Overlay.Menu>
    </>
  );
});

export { NewMissionOverlay };
