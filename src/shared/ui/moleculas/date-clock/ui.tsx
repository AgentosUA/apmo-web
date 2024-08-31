import { FC, PropsWithChildren, useEffect, useState } from 'react';

import { getTime } from './lib';

import styles from './ui.module.scss';
import classNames from 'classnames';

const DateClock: FC<{
  variant?: 'simple' | 'styled';
  className?: string;
  customTime?: {
    hours?: string | number;
    minutes?: string | number;
    seconds?: string | number;
  };
}> = ({ customTime, className, variant = 'styled' }) => {
  const [date, setDate] = useState(getTime());

  useEffect(() => {
    if (customTime) return;

    const interval = setInterval(() => {
      setDate(getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const actualDate = customTime ? customTime : date;

  if (variant === 'styled') {
    return (
      <span className={classNames(styles.clock, className)}>
        {actualDate.hours}:{actualDate.minutes}
        <span className={styles.seconds}>{actualDate.seconds}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {actualDate.hours}:{actualDate.minutes}:{actualDate.seconds}
    </span>
  );
};

export { DateClock };
