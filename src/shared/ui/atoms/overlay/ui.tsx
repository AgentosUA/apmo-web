import { FC, PropsWithChildren, ReactNode } from 'react';

import classNames from 'classnames';

import { MdArrowBackIosNew } from 'react-icons/md';

import styles from './ui.module.scss';

const Header: FC<{
  title?: string;
  rightCorner?: ReactNode;
  onBack?: () => void;
}> = ({ title = '', rightCorner = '', onBack }) => (
  <div className={styles.header}>
    <MdArrowBackIosNew
      className={styles.backArrowIcon}
      onClick={onBack}
      color='#fff'
    />
    <h1 className={styles.headerTitle}>{title}</h1>
    <div className={styles.rightCorner}>{rightCorner}</div>
  </div>
);

const MenuWrapper: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ className, children }) => (
  <div className={classNames(styles.menuWrapper, className)}>{children}</div>
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

const Menu: FC<
  PropsWithChildren<{
    className?: string;
    variant?: 'primary' | 'secondary';
  }>
> = ({ className, children, variant = 'primary' }) => (
  <div className={classNames(styles.menu, styles[variant], className)}>
    {children}
  </div>
);

const Content: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ className, children }) => (
  <div className={classNames(styles.content, className)}>{children}</div>
);

const Overlay = {
  Header,
  MenuWrapper,
  Menu,
  MenuItem,
  Content,
};

export { Overlay };
