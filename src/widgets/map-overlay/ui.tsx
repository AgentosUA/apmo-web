import { ChangeEvent, useEffect, useRef } from 'react';

import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay, useMenu } from '@/shared/ui/atoms/overlay';
import { DateClock } from '@/shared/ui/moleculas/date-clock/ui';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { View } from '@/shared/ui/quarks/view';
import { observer } from 'mobx-react-lite';

import { missionEntity } from '@/entities/mission';

import styles from './ui.module.scss';

const MapOverlay = observer(() => {
  if (!mapsEntity.selectedMap) return null;

  const { active, onMenuItemClick, setActive } = useMenu({
    map: true,
    markers: false,
    plan: false,
    mission: false,
    briefing: false,
    author: false,
    dlcs: false,
  });

  const onCopyMarkers = () => {
    markersEntity.SWTMarkerToClipboard();
  };

  const onLoadMarkers = () => {
    markersEntity.SWTMarkerFromClipboard();
  };

  const onFileInputClick = () => {
    inputRef?.current?.click?.();
  };

  const onMissionUpload = (e: ChangeEvent<HTMLInputElement>) => {
    missionEntity.loadMission(e.target.files?.[0]);
  };

  const onCofrimClearMarkers = () => {
    markersEntity.clearMarkers();
    toasterEntity.callToaster({
      title: 'Markers cleared',
      description: 'All markers have been removed',
    });
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const onBackClick = () => {
    missionEntity.resetMission();
    mapsEntity.unselectMap();
    markersEntity.clearMarkers();
  };

  useEffect(() => {
    if (missionEntity.briefing?.diary?.length) {
      const diaryIds = missionEntity.briefing.diary.map((item) => item.id);

      const newActive = {
        ...active,
      };

      diaryIds.forEach((id) => {
        newActive[id] = false;
      });

      console.log(newActive);

      setActive(newActive);
    }
  }, [missionEntity.briefing]);

  return (
    <>
      <input
        ref={inputRef}
        onChange={onMissionUpload}
        className={styles.hidden}
        multiple={false}
        type='file'
        accept='.pbo'
      />
      <Overlay.Header
        title={missionEntity.missionName || mapsEntity.selectedMap.name}
        onBack={onBackClick}
        rightCorner={<DateClock className={styles.clock} />}
      />
      <Overlay.MenuWrapper>
        <Overlay.Menu>
          <Overlay.MenuItem
            isActive={active.map}
            onClick={() => onMenuItemClick('map')}>
            Map
          </Overlay.MenuItem>

          <View.Condition if={Boolean(missionEntity.briefing)}>
            <Overlay.MenuItem
              isActive={active.briefing}
              onClick={() => onMenuItemClick('briefing')}>
              Briefing
            </Overlay.MenuItem>
          </View.Condition>

          <Overlay.MenuItem
            isActive={active.markers}
            onClick={() => onMenuItemClick('markers')}>
            Markers
          </Overlay.MenuItem>

          <View.Condition if={!missionEntity.fileName}>
            <Overlay.MenuItem
              isActive={active.mission}
              onClick={() => onMenuItemClick('mission')}>
              Mission
            </Overlay.MenuItem>
          </View.Condition>

          <Overlay.MenuItem
            isActive={active.plan}
            onClick={() => onMenuItemClick('plan')}>
            Plan
          </Overlay.MenuItem>
        </Overlay.Menu>

        <View.Condition if={active.markers}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={onLoadMarkers}>
              Load Markers
            </Overlay.MenuItem>

            <Overlay.MenuItem onClick={onCopyMarkers}>
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

        <View.Condition if={active.mission && !missionEntity.fileName}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={onFileInputClick}>
              Upload mission
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.plan}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={markersEntity.SWTMarkerFromClipboard}>
              Save Plan
            </Overlay.MenuItem>
            <Overlay.MenuItem onClick={markersEntity.SWTMarkerFromClipboard}>
              Share Plan
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.briefing}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={markersEntity.SWTMarkerFromClipboard}>
              Intel
            </Overlay.MenuItem>
            {missionEntity?.briefing?.diary?.map((item) => (
              <Overlay.MenuItem
                key={item.id}
                onClick={() => onMenuItemClick('briefing', item.id)}>
                {item.name}
              </Overlay.MenuItem>
            ))}
          </Overlay.Menu>
        </View.Condition>

        <View.Condition
          if={Boolean(
            missionEntity?.briefing?.diary?.some((key) => active[key.id])
          )}>
          <Overlay.Menu variant='secondary'>
            {missionEntity?.briefing?.diary
              ?.filter((item) => active[item.id])
              .map((item) => (
                <Overlay.MenuItem key={item.id}>
                  <div
                    className={styles.html}
                    dangerouslySetInnerHTML={{ __html: item.value.trim() }}
                  />
                </Overlay.MenuItem>
              ))}
          </Overlay.Menu>
        </View.Condition>
      </Overlay.MenuWrapper>
    </>
  );
});

export { MapOverlay };
