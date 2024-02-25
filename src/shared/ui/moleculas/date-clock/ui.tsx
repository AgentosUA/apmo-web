import { FC, useEffect, useState } from 'react';

import { getTime } from './lib';

import styles from './ui.module.scss';
import classNames from 'classnames';

const DateClock: FC<{
  variant?: 'simple' | 'styled';
  className?: string;
}> = ({ className, variant = 'styled' }) => {
  const [date, setDate] = useState(getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'styled') {
    return (
      <span className={classNames(styles.clock, className)}>
        {date.hours}:{date.minutes}
        <span className={styles.seconds}>{date.seconds}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {date.hours}:{date.minutes}:{date.seconds}
    </span>
  );
};

export { DateClock };
