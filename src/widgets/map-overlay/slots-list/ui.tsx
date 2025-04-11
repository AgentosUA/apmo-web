import { Callsigns, Group, Side } from '@/entities/mission/types';
import { FC, Fragment, useEffect } from 'react';

import styles from './ui.module.scss';
import classNames from 'classnames';
import { callsigns, callsignsObject } from '@/entities/mission/data';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';
import { Input } from '@/shared/ui/atoms/input/ui';
import { Mission, missionEntity } from '@/entities/mission';
import { useFormik } from 'formik';
import { Button } from '@/shared/ui/atoms/button';
import { observer } from 'mobx-react-lite';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { useBreakpoint, View } from '@/shared/ui/quarks/view';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import i18next from 'i18next';
import { i18n } from '@/shared/lib/i18n/config';

const MissionSlotList: FC<{
  groups?: Group[];
  side: Side;
}> = ({ groups = [], side }) => {
  const onGroupClick = (group: Group) => {
    basicMapEntity.flyTo(
      group.units[0].position.coordinates.y,
      group.units[0].position.coordinates.x
    );
  };

  return (
    <ul className={classNames(styles.list)}>
      {groups
        .filter((group) => group.side === side)
        .map((group, index) => (
          <Fragment key={group.id}>
            <li className={styles.group}>
              <span
                onClick={() => onGroupClick(group)}
                className={classNames(styles.callsign, styles.link)}>
                {callsigns[index]}
              </span>
              <ol className={styles.units}>
                {group.units.map((item) => (
                  <li key={item.id}>{item.description ?? item.type}</li>
                ))}
              </ol>
            </li>
            {/* {index + 1 !== groups.length && <hr />} */}
          </Fragment>
        ))}
    </ul>
  );
};

const PlayerSlotList: FC<{
  slots: Callsigns;
}> = observer(({ slots = callsignsObject }) => {
  const formik = useFormik({
    initialValues: {
      ...slots,
    },
    enableReinitialize: true,
    onSubmit: () => { },
  });

  useEffect(() => {
    if (!missionEntity.data) return;

    missionEntity.data.slots = {
      ...formik.values,
    };
  }, [formik.values]);

  const onListClick = () => {
    missionEntity.slotsType = 'list';
  };

  const onGridClick = () => {
    missionEntity.slotsType = 'grid';
  };

  const onCopySlots = () => {
    const slots = Object.keys(formik.values)
      .filter((key) => Boolean(formik.values[key]))
      .map((key) => `${key}: ${formik.values[key]}`);

    navigator.clipboard.writeText(slots.join('\n'));

    toasterEntity.call({
      title: 'entities:slots:copiedTitle',
      description: 'entities:slots:copiedDescription',
    });
  };

  const { isDesktop, isTablet } = useBreakpoint();

  return (
    <div className={styles.slotsWrapper}>
      <div className={styles.slotsHeader}>
        <h3 className={styles.title}>
          <Localize translationKey='widgets:mapOverlay:slots' />
        </h3>
        <div className={styles.slotsActions}>
          <View.Condition if={isDesktop || isTablet}>
            <Button onClick={onListClick} size='sm'>
              <Localize translationKey='widgets:mapOverlay:list' />
            </Button>
            <Button onClick={onGridClick} size='sm'>
              <Localize translationKey='widgets:mapOverlay:grid' />
            </Button>
          </View.Condition>
          <Button onClick={onCopySlots} className={styles.copy} size='sm'>
            <Localize translationKey='widgets:mapOverlay:copySlots' />
          </Button>
        </div>
      </div>
      <div
        className={classNames(styles.slots, {
          [styles.slotsList]: missionEntity.slotsType === 'list',
        })}>
        {callsigns.map((callsign, index) => (
          <Fragment key={callsign}>
            <div className={styles.slot}>
              <span className={styles.callsign}>{callsigns[index]}</span>
              <Input
                id={callsign}
                className={styles.input}
                placeholder={i18n.t('widgets:mapOverlay:enterSquadName') as string}
                value={formik.values[callsign]}
                onChange={formik.handleChange}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
});

export { MissionSlotList, PlayerSlotList };
