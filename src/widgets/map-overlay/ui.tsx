import { ChangeEvent, Fragment, useEffect, useRef } from 'react';

import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { Overlay, useMenu } from '@/shared/ui/atoms/overlay';
import { DateClock } from '@/shared/ui/moleculas/date-clock/ui';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { View } from '@/shared/ui/quarks/view';
import { observer } from 'mobx-react-lite';

import { missionEntity } from '@/entities/mission';

import dayjs from 'dayjs';

import { planEntity } from '@/entities/plan';

import { getIslandClassNameByPboFile } from '@/entities/mission/lib';

import { MissionSlotList, PlayerSlotList } from './slots-list';

import styles from './ui.module.scss';

const MapOverlay = observer<{
  isPlan?: boolean;
  onBackClick?: () => void;
}>(({ isPlan = false, onBackClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { active, onMenuItemClick, setActive } = useMenu({
    map: true,
    markers: false,
    plan: false,
    mission: false,
    briefing: false,
    author: false,
    dlcs: false,
    intel: false,
    slotsBLUEFOR: false,
    slotsOPFOR: false,
    squadSlots: false,
  });

  const onSwitchUnitsNames = () => {
    markersEntity.switchPlayersName();
  };

  const onSwitchPlayersDisplayMode = () => {
    if (markersEntity.playersDisplayMode === 'groups') {
      markersEntity.showAllPlayers();
    } else {
      markersEntity.showGroupsOnly();
    }
  };

  const onCopyMarkers = () => {
    markersEntity.SWTMarkerToClipboard();
  };

  const onLoadMarkers = () => {
    markersEntity.SWTMarkerFromClipboard();
  };

  const onSharePlan = () => {
    navigator.clipboard.writeText(window.location.href);

    toasterEntity.call({
      title: 'Plan link copied',
      description: 'You can share it with your team',
    });
  };

  const onFileInputClick = () => {
    inputRef?.current?.click?.();
  };

  const onMissionUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const islandClassName = getIslandClassNameByPboFile(
      e.target.files?.[0]
    ).toLowerCase();

    if (islandClassName !== mapsEntity.selectedMap?.id) {
      toasterEntity.call({
        title: 'Map and mission mismatch',
        description: `Mission is not on ${mapsEntity.selectedMap?.name}!`,
      });

      return;
    }

    missionEntity.loadMission(e.target.files?.[0]);
  };

  const onCofrimClearMarkers = () => {
    markersEntity.clearSWTMarkers();
    toasterEntity.call({
      title: 'Markers cleared',
      description: 'All markers have been removed',
    });
  };

  const onResetClick = () => {
    missionEntity.resetMission();
    mapsEntity.unselectMap();
    markersEntity.clearMarkers();
  };

  useEffect(() => {
    if (!mapsEntity.selectedMap) return;

    mapsEntity.getLocations(mapsEntity.selectedMap.dir);
  }, [mapsEntity.selectedMap]);

  useEffect(() => {
    if (missionEntity?.data?.briefing?.diary?.length) {
      const diaryIds = missionEntity?.data?.briefing.diary.map(
        (item) => item.id
      );

      const newActive = {
        ...active,
      };

      diaryIds.forEach((id) => {
        newActive[id] = false;
      });

      setActive(newActive);
    }
  }, [missionEntity?.data?.briefing]);

  if (!mapsEntity.selectedMap) return null;

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
        title={
          planEntity.title ||
          missionEntity?.data?.missionName ||
          mapsEntity.selectedMap.name
        }
        onBack={() => {
          onBackClick ? onBackClick() : onResetClick();
        }}
        rightCorner={
          <DateClock
            className={styles.clock}
            customTime={
              missionEntity?.data?.briefing?.intel?.hour
                ? {
                    hours: missionEntity?.data?.briefing?.intel?.hour,
                    minutes: missionEntity?.data?.briefing?.intel?.minute
                      ? missionEntity?.data?.briefing?.intel?.minute
                      : '00',
                    seconds: '00',
                  }
                : undefined
            }
          />
        }
      />
      <Overlay.MenuWrapper>
        <Overlay.Menu>
          <Overlay.MenuItem
            isActive={active.map}
            onClick={() => onMenuItemClick('map')}>
            Map
          </Overlay.MenuItem>

          <View.Condition if={Boolean(missionEntity?.data?.briefing)}>
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

          <Overlay.MenuItem
            isActive={active.mission}
            onClick={() => onMenuItemClick('mission')}>
            Mission
          </Overlay.MenuItem>

          <View.Condition if={Boolean(missionEntity?.data?.fileName)}>
            <Overlay.MenuItem
              isActive={active.squadSlots}
              onClick={() => onMenuItemClick('squadSlots')}>
              Slots
            </Overlay.MenuItem>
          </View.Condition>

          <View.Condition if={Boolean(missionEntity?.data?.fileName)}>
            <Overlay.MenuItem
              isActive={active.plan}
              onClick={() => onMenuItemClick('plan')}>
              Plan
            </Overlay.MenuItem>
          </View.Condition>
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
              trigger={
                <Overlay.MenuItem onClick={() => ({})}>
                  Clear Markers
                </Overlay.MenuItem>
              }
            />

            <View.Condition if={Boolean(missionEntity?.data?.missionName)}>
              <Overlay.MenuItem onClick={onSwitchPlayersDisplayMode}>
                {markersEntity.playersDisplayMode === 'groups'
                  ? 'Show all players'
                  : 'Show groups'}
              </Overlay.MenuItem>
            </View.Condition>

            <View.Condition
              if={
                Boolean(missionEntity?.data?.missionName) &&
                markersEntity.playersDisplayMode === 'players'
              }>
              <Overlay.MenuItem onClick={onSwitchUnitsNames}>
                {markersEntity.isPlayersNameVisible
                  ? 'Hide names'
                  : 'Show names'}
              </Overlay.MenuItem>
            </View.Condition>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.plan}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem onClick={planEntity.savePlan}>
              Save Plan
            </Overlay.MenuItem>
            <View.Condition if={isPlan}>
              <Overlay.MenuItem onClick={onSharePlan}>
                Share Plan
              </Overlay.MenuItem>
            </View.Condition>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.briefing}>
          <Overlay.Menu variant='secondary'>
            {missionEntity?.data?.briefing?.diary?.map((item) => (
              <Overlay.MenuItem
                key={item.id}
                isActive={active[item.id]}
                onClick={() => onMenuItemClick('briefing', item.id)}>
                {item.name}
              </Overlay.MenuItem>
            ))}
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.mission}>
          <Overlay.Menu variant='secondary'>
            <View.Condition if={Boolean(!missionEntity?.data?.fileName)}>
              <Overlay.MenuItem onClick={onFileInputClick}>
                Upload mission
              </Overlay.MenuItem>
            </View.Condition>

            <View.Condition if={Boolean(missionEntity?.data?.fileName)}>
              <Overlay.MenuItem
                isActive={active.intel}
                onClick={() => onMenuItemClick('mission', 'intel')}>
                Intel
              </Overlay.MenuItem>
              <View.Condition if={Boolean(missionEntity?.data?.dlcs)}>
                <Overlay.MenuItem
                  isActive={active.dlcs}
                  onClick={() => onMenuItemClick('mission', 'dlcs')}>
                  DLC used
                </Overlay.MenuItem>
              </View.Condition>
              {missionEntity?.data?.groups.some(
                (item) => item.side === 'West'
              ) && (
                <Overlay.MenuItem
                  isActive={active.slotsBluefor}
                  onClick={() => onMenuItemClick('mission', 'slotsBluefor')}>
                  Slots BLUEFOR
                </Overlay.MenuItem>
              )}
              {missionEntity?.data?.groups.some(
                (item) => item.side === 'East'
              ) && (
                <Overlay.MenuItem
                  isActive={active.slotsOpfor}
                  onClick={() => onMenuItemClick('mission', 'slotsOpfor')}>
                  Slots OPFOR
                </Overlay.MenuItem>
              )}
              {missionEntity?.data?.groups.some(
                (item) => item.side === 'Independent'
              ) && (
                <Overlay.MenuItem
                  isActive={active.slotsIndependent}
                  onClick={() =>
                    onMenuItemClick('mission', 'slotsIndependent')
                  }>
                  Slots Independent
                </Overlay.MenuItem>
              )}
            </View.Condition>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition
          if={Boolean(
            missionEntity?.data?.briefing?.diary?.some((key) => active[key.id])
          )}>
          <Overlay.Menu className={styles.diary} variant='secondary'>
            {missionEntity?.data?.briefing?.diary
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

        <View.Condition if={active.dlcs && Boolean(missionEntity?.data?.dlcs)}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <ul className={styles.list}>
                {missionEntity?.data?.dlcs?.map((dlc) => (
                  <li key={dlc}>{dlc}</li>
                ))}
              </ul>
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.slotsBluefor}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <MissionSlotList
                groups={missionEntity?.data?.groups}
                side='West'
              />
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.slotsOpfor}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <MissionSlotList
                groups={missionEntity?.data?.groups}
                side='East'
              />
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.slotsIndependent}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <MissionSlotList
                groups={missionEntity?.data?.groups}
                side='Independent'
              />
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.intel}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <ul className={styles.list}>
                {missionEntity?.data?.briefing?.intel?.day && (
                  <li>
                    <b>Date:</b>{' '}
                    {dayjs(missionEntity?.data?.briefing?.intel?.day).format(
                      'DD'
                    )}
                    ,{' '}
                    {dayjs(missionEntity?.data?.briefing?.intel?.month).format(
                      'MMMM'
                    )}
                  </li>
                )}
                <li>
                  <b>Time:</b>{' '}
                  {dayjs(missionEntity?.data?.briefing?.intel?.hour).format(
                    'hh'
                  )}
                  :
                  {dayjs(missionEntity?.data?.briefing?.intel?.minute).format(
                    'mm'
                  )}
                </li>
                <li>
                  <b>Description:</b>{' '}
                  {missionEntity?.data?.briefing?.intel?.overviewText}
                </li>
              </ul>
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.squadSlots}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <PlayerSlotList slots={missionEntity?.data?.slots ?? null} />
            </Overlay.MenuItem>
          </Overlay.Menu>
        </View.Condition>
      </Overlay.MenuWrapper>
    </>
  );
});

export { MapOverlay };
