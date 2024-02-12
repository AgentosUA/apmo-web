import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay } from '@/shared/ui/atoms/overlay';
import { observer } from 'mobx-react-lite';

const NewMissionOverlay = observer(() => {
  if (!mapsEntity.selectedMap) return null;

  return (
    <>
      <Overlay.Header
        title={
          mapsEntity.selectedMap.description || mapsEntity.selectedMap.name
        }
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
        {/* <Overlay.MenuItem>Save plan</Overlay.MenuItem> */}
      </Overlay.Menu>
    </>
  );
});

export { NewMissionOverlay };
