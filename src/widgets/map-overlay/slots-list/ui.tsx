import { Group, Side } from '@/entities/mission/types';
import { FC, Fragment } from 'react';

import styles from './ui.module.scss';
import classNames from 'classnames';
import { callsigns } from '@/entities/mission/data';
import { basicMapEntity } from '@/shared/ui/atoms/basic-map/model';

const SlotsList: FC<{
  groups: Group[];
  side: Side;
}> = ({ groups, side }) => {
  const onGroupClick = (group: Group) => {
    basicMapEntity.flyTo(
      group.units[0].position.coordinates.y,
      group.units[0].position.coordinates.x
    );
  };

  return (
    <ul className={classNames(styles.list, styles.slots)}>
      {groups
        .filter((group) => group.side === side)
        .map((group, index) => (
          <Fragment key={group.id}>
            <li className={styles.group}>
              <span
                onClick={() => onGroupClick(group)}
                className={styles.callsign}>
                {callsigns[index]}
              </span>
              <ol className={styles.units}>
                {group.units.map((item) => (
                  <li key={item.id}>{item.description}</li>
                ))}
              </ol>
            </li>
            {/* {index + 1 !== groups.length && <hr />} */}
          </Fragment>
        ))}
    </ul>
  );
};

export { SlotsList };
