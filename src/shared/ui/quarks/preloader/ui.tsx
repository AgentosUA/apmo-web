import { FC, PropsWithChildren, ReactNode } from 'react';

import styles from './ui.module.scss';

const Preloader: FC<
  PropsWithChildren<{
    className?: string;
    isLoading: boolean;
  }>
> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <div className={styles.preloader}>
        <div className={styles.ldsRing}>
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }

  return children;
};

export { Preloader };
