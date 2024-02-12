import { FC, PropsWithChildren } from 'react';

import classNames from 'classnames';

import { MdArrowBackIosNew } from 'react-icons/md';

import styles from './ui.module.scss';

const Header: FC<{
  title?: string;
  time?: string;
  onBack?: () => void;
}> = ({ title = '', time = '', onBack }) => (
  <div className={styles.header}>
    <MdArrowBackIosNew
      className={styles.backArrowIcon}
      onClick={onBack}
      color='#fff'
    />
    <h1 className={styles.headerTitle}>{title}</h1>
    <p className={styles.time}>{time}</p>
  </div>
);

const MenuItem: FC<
  PropsWithChildren<{
    onClick?: () => void;
    isActive?: boolean;
  }>
> = ({ children, isActive, onClick }) => (
  <p
    onClick={onClick}
    className={classNames(styles.item, { [styles.itemActive]: isActive })}>
    {children}
  </p>
);

const Menu: FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className={styles.menu}>{children}</div>
);

const Overlay = {
  Header,
  Menu,
  MenuItem,
};

export { Overlay };
