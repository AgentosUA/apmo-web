'use client';

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import { cn } from '@/shared/utils/cn';

import { fieldVariants } from '../input/ui';

type SelectOption = {
  value: string;
  /** Plain text — `<option>` cannot render markup. */
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'size' | 'children'> & {
  label?: ReactNode;
  options: SelectOption[];
  size?: 'sm' | 'md';
  /** Applied to the `<select>`; `className` goes to the wrapper. */
  selectClassName?: string;
};

/** Native `<select>` styled like `Input` (keyboard and mobile pickers for free). */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, selectClassName, label, options, size, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className={cn('group flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs uppercase tracking-[0.08em] text-white/60 transition-colors select-none group-focus-within:text-a3-orange"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              fieldVariants({ size }),
              'appearance-none cursor-pointer pr-9 [&>option]:bg-[#111] [&>option]:text-white',
              selectClassName
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
          />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
