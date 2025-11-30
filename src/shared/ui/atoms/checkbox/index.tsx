import { CheckIcon } from 'lucide-react';
import { FC } from 'react';

import { cn } from '@/shared/utils/cn';

export const Checkbox: FC<{
  className?: string;
  checked: boolean;
}> = ({ checked, className }) => (
  <div
    className={cn(
      'size-4 border border-primary flex items-center justify-center',
      className
    )}>
    {checked && <CheckIcon className='size-2 text-primary' />}
  </div>
);
