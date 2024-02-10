import { FC } from 'react';

import styles from './ui.module.scss';
import classNames from 'classnames';

const Header: FC<{
  title?: string;
  time?: string;
  onBack?: () => void;
}> = ({ title = '', time = '' }) => (
  <div className={styles.header}>
    <h1 className={styles.headerTitle}>{title}</h1>
    <p className={styles.time}>{time}</p>
  </div>
);

const Menu: FC<{}> = () => (
  <>
    <div className={styles.menu}>
      {/* <button>back</button> */}
      <p className={classNames(styles.item, styles.itemActive)}>Map</p>
      <p className={styles.item}>Briefing</p>
      <p className={styles.item}>Save markers</p>
      <p className={styles.item}>Load markers</p>
      <p className={styles.item}>Share</p>
    </div>
  </>
);

const Overlay = {
  Header,
  Menu,
};

export { Overlay };
