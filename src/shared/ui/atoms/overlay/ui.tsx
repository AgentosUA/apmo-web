import { FC } from 'react';

import styles from './ui.module.scss';

const Header: FC<{
  title?: string;
  time?: string;
  onBack?: () => void;
}> = ({ title = '', time = '' }) => (
  <header className={styles.header}>
    {/* <button>back</button> */}
    <h1>{title}</h1>
    <p className={styles.time}>{time}</p>
  </header>
);

const Overlay = {
  Header,
};

export { Overlay };
