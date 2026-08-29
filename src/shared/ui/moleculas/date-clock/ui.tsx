import { FC, useEffect, useState } from 'react';

import { cn } from '@/shared/utils/cn';

import { getTime } from './lib';

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
  }, [customTime]);

  const actualDate = customTime ? customTime : date;

  if (variant === 'styled') {
    return (
      <span className={cn('text-[#FAFAFA] text-lg', className)}>
        {actualDate.hours}:{actualDate.minutes}
        <span className="text-sm">{actualDate.seconds}</span>
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
