import { observer } from 'mobx-react-lite';
import { ChangeEvent, Fragment, MouseEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsPencil } from 'react-icons/bs';

import { mapsEntity } from '@/entities/maps';
import { markersEntity } from '@/entities/markers';
import { missionEntity } from '@/entities/mission';
import { findMissionMarkerByName, getIslandClassNameByPboFile } from '@/entities/mission/lib';
import { planEntity } from '@/entities/plan';
import { useLeavePlanGuard } from '@/features/plan/leave-plan';
import { RenamePlanDialog, renameOpenPlan } from '@/features/plan/rename-plan';
import { i18n } from '@/shared/lib/i18n/config';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { Overlay, useMenu } from '@/shared/ui/atoms/overlay';
import { DateClock } from '@/shared/ui/moleculas/date-clock/ui';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { View } from '@/shared/ui/quarks/view';
import { PlanToolbar } from '@/widgets/plan-toolbar';

import { MissionSlotList, PlayerSlotList } from './slots-list';

const pad2 = (value?: number) => String(value ?? 0).padStart(2, '0');

// The app uses `cz` for Czech, Intl expects the ISO code `cs`.
const toIntlLocale = (language: string) => (language === 'cz' ? 'cs' : language);

/** Mission date from mission.sqm Intel (month is 1-based): "June 12" / "12 червня" / "12. června". */
const formatIntelDate = (language: string, day?: number, month?: number) => {
  if (!day) return '';
  if (!month) return String(day);

  // Leap year so 29 February stays valid.
  return new Intl.DateTimeFormat(toIntlLocale(language), { day: 'numeric', month: 'long' }).format(
    new Date(2000, month - 1, day)
  );
};

/** Briefing links to markers (`<marker name='…'>`, as in the in-game diary): focus the map on it. */
const onBriefingClick = (event: MouseEvent<HTMLDivElement>) => {
  const link = (event.target as HTMLElement).closest('marker');
  const name = link?.getAttribute('name');

  if (!name) return;

  const marker = findMissionMarkerByName(missionEntity.data?.markers, name);

  if (!marker) {
    // Markers created by scripts exist only in the game.
    toasterEntity.call({
      title: 'toasters:briefingMarkerNotFoundTitle',
      description: link?.textContent?.trim() || name,
    });

    return;
  }

  basicMapEntity.flyTo(marker.position.coordinates.x, marker.position.coordinates.y);
};

const MapOverlay = observer<{
  onBackClick?: () => void;
}>(({ onBackClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { i18n: i18nInstance } = useTranslation();

  const { active, onMenuItemClick, setActive } = useMenu({
    map: true,
    markers: false,
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
        title: i18n.t('toasters:mapAndMissionMismatch'),
        description: i18n.t('toasters:missionIsNotOnMap', { map: mapsEntity.selectedMap?.name }),
      });

      return;
    }

    await missionEntity.loadMission(e.target.files?.[0]);

    // A saved plan keeps the mission right away (changes are saved automatically).
    if (planEntity.isSaved && missionEntity.data?.fileName) {
      await planEntity.saveMission();
    }
  };

  const onCofrimClearMarkers = () => {
    markersEntity.clearSWTMarkers();
    toasterEntity.call({
      title: 'entities:markers:clearedTitle',
      description: 'entities:markers:clearedDescription',
    });
  };

  const onResetClick = () => {
    missionEntity.resetMission();
    mapsEntity.unselectMap();
    markersEntity.clearMarkers();
  };

  const { requestLeave, modal: leavePlanModal } = useLeavePlanGuard(() => {
    onBackClick ? onBackClick() : onResetClick();
  });

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

  const title =
    planEntity.title || missionEntity?.data?.missionName || mapsEntity.selectedMap.name;

  return (
    <>
      {leavePlanModal}
      <input
        ref={inputRef}
        onChange={onMissionUpload}
        className="hidden"
        multiple={false}
        type='file'
        accept='.pbo'
      />
      <Overlay.Header
        title={
          planEntity.canEdit ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="truncate">{title}</span>
              <RenamePlanDialog
                title={title}
                onRename={renameOpenPlan}
                trigger={
                  <button
                    type="button"
                    title={i18n.t('widgets:planToolbar:renameTitle')}
                    aria-label={i18n.t('widgets:planToolbar:renameTitle')}
                    className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center text-sm text-white/60 border border-solid border-white/15 hover:text-white hover:border-a3-orange focus-visible:outline-none focus-visible:border-a3-orange transition-colors"
                  >
                    <BsPencil aria-hidden />
                  </button>
                }
              />
            </span>
          ) : (
            title
          )
        }
        onBack={requestLeave}
        actions={<PlanToolbar />}
        rightCorner={
          <DateClock
            className="mr-2.5"
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
            <Localize translationKey='widgets:mapOverlay:map' />
          </Overlay.MenuItem>

          <View.Condition if={Boolean(missionEntity?.data?.briefing)}>
            <Overlay.MenuItem
              isActive={active.briefing}
              onClick={() => onMenuItemClick('briefing')}>
              <Localize translationKey='widgets:mapOverlay:briefing' />
            </Overlay.MenuItem>
          </View.Condition>

          <Overlay.MenuItem
            isActive={active.markers}
            onClick={() => onMenuItemClick('markers')}>
            <Localize translationKey='widgets:mapOverlay:markers' />
          </Overlay.MenuItem>

          <Overlay.MenuItem
            isActive={active.mission}
            onClick={() => onMenuItemClick('mission')}>
            <Localize translationKey='widgets:mapOverlay:mission' />
          </Overlay.MenuItem>

          <View.Condition if={Boolean(missionEntity?.data?.fileName)}>
            <Overlay.MenuItem
              isActive={active.squadSlots}
              onClick={() => onMenuItemClick('squadSlots')}>
              <Localize translationKey='widgets:mapOverlay:slots' />
            </Overlay.MenuItem>
          </View.Condition>

        </Overlay.Menu>

        <View.Condition if={active.markers}>
          <Overlay.Menu variant='secondary'>
            <View.Condition if={planEntity.canEdit}>
              <Overlay.MenuItem onClick={onLoadMarkers}>
                <Localize translationKey='widgets:mapOverlay:loadMarkers' />
              </Overlay.MenuItem>
            </View.Condition>

            <Overlay.MenuItem onClick={onCopyMarkers}>
              <Localize translationKey='widgets:mapOverlay:copyMarkers' />
            </Overlay.MenuItem>

            <View.Condition if={planEntity.canEdit}>
              <Modal
                title={<Localize translationKey='widgets:mapOverlay:clearMarkersTitle' />}
                description={<Localize translationKey='widgets:mapOverlay:clearMarkersDescription' />}
                onConfirm={onCofrimClearMarkers}
                onCancel
                trigger={
                  <Overlay.MenuItem onClick={() => ({})}>
                    <Localize translationKey='widgets:mapOverlay:clearMarkers' />
                  </Overlay.MenuItem>
                }
              />
            </View.Condition>

            <View.Condition if={Boolean(missionEntity?.data?.missionName)}>
              <Overlay.MenuItem onClick={onSwitchPlayersDisplayMode}>
                {markersEntity.playersDisplayMode === 'groups'
                  ? <Localize translationKey='widgets:mapOverlay:showAllPlayers' />
                  : <Localize translationKey='widgets:mapOverlay:showGroups' />}
              </Overlay.MenuItem>
            </View.Condition>

            <View.Condition
              if={
                Boolean(missionEntity?.data?.missionName) &&
                markersEntity.playersDisplayMode === 'players'
              }>
              <Overlay.MenuItem onClick={onSwitchUnitsNames}>
                {markersEntity.isPlayersNameVisible
                  ? <Localize translationKey='widgets:mapOverlay:hideNames' />
                  : <Localize translationKey='widgets:mapOverlay:showNames' />}
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
            <View.Condition if={!missionEntity?.data?.fileName && planEntity.canEdit}>
              <Overlay.MenuItem onClick={onFileInputClick}>
                <Localize translationKey='widgets:mapOverlay:uploadMission' />
              </Overlay.MenuItem>
            </View.Condition>

            <View.Condition if={Boolean(missionEntity?.data?.fileName)}>
              <Overlay.MenuItem
                isActive={active.intel}
                onClick={() => onMenuItemClick('mission', 'intel')}>
                <Localize translationKey='widgets:mapOverlay:intel' />
              </Overlay.MenuItem>
              <View.Condition if={Boolean(missionEntity?.data?.dlcs)}>
                <Overlay.MenuItem
                  isActive={active.dlcs}
                  onClick={() => onMenuItemClick('mission', 'dlcs')}>
                  <Localize translationKey='widgets:mapOverlay:dlcs' />
                </Overlay.MenuItem>
              </View.Condition>
              {missionEntity?.data?.groups.some(
                (item) => item.side === 'West'
              ) && (
                  <Overlay.MenuItem
                    isActive={active.slotsBluefor}
                    onClick={() => onMenuItemClick('mission', 'slotsBluefor')}>
                    <Localize translationKey='widgets:mapOverlay:slotsBluefor' />
                  </Overlay.MenuItem>
                )}
              {missionEntity?.data?.groups.some(
                (item) => item.side === 'East'
              ) && (
                  <Overlay.MenuItem
                    isActive={active.slotsOpfor}
                    onClick={() => onMenuItemClick('mission', 'slotsOpfor')}>
                    <Localize translationKey='widgets:mapOverlay:slotsOpfor' />
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
                    <Localize translationKey='widgets:mapOverlay:slotsIndependent' />
                  </Overlay.MenuItem>
                )}
            </View.Condition>
          </Overlay.Menu>
        </View.Condition>

        <View.Condition
          if={Boolean(
            missionEntity?.data?.briefing?.diary?.some((key) => active[key.id])
          )}>
          <Overlay.Menu variant="secondary">
            {missionEntity?.data?.briefing?.diary
              ?.filter((item) => active[item.id])
              .map((item) => (
                <Overlay.MenuItem key={item.id}>
                  <div
                    className="max-w-[540px] leading-6 [&_a]:underline [&_marker]:underline [&_marker]:cursor-pointer [&_marker]:text-a3-orange [&_marker:hover]:brightness-125"
                    onClick={onBriefingClick}
                    dangerouslySetInnerHTML={{ __html: item.value.trim() }}
                  />
                </Overlay.MenuItem>
              ))}
          </Overlay.Menu>
        </View.Condition>

        <View.Condition if={active.dlcs && Boolean(missionEntity?.data?.dlcs)}>
          <Overlay.Menu variant='secondary'>
            <Overlay.MenuItem>
              <ul className="leading-6 text-white [&_b]:text-white">
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
              <ul className="leading-6 text-white [&_b]:text-white">
                {missionEntity?.data?.briefing?.intel?.day && (
                  <li>
                    <b>
                      <Localize translationKey="widgets:mapOverlay:intelDate" />:
                    </b>{' '}
                    {formatIntelDate(
                      i18nInstance.language,
                      missionEntity?.data?.briefing?.intel?.day,
                      missionEntity?.data?.briefing?.intel?.month
                    )}
                  </li>
                )}
                <li>
                  <b>
                    <Localize translationKey="widgets:mapOverlay:intelTime" />:
                  </b>{' '}
                  {pad2(missionEntity?.data?.briefing?.intel?.hour)}:
                  {pad2(missionEntity?.data?.briefing?.intel?.minute)}
                </li>
                <li>
                  <b>
                    <Localize translationKey="widgets:mapOverlay:intelDescription" />:
                  </b>{' '}
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
