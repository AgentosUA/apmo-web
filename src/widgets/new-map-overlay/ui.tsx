import { mapsEntity } from '@/entities/maps';
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
        <Overlay.MenuItem>Import Markers</Overlay.MenuItem>
        <Overlay.MenuItem>Export Markers</Overlay.MenuItem>
        <Overlay.MenuItem>Save plan</Overlay.MenuItem>
      </Overlay.Menu>
    </>
  );
});

export { NewMissionOverlay };
