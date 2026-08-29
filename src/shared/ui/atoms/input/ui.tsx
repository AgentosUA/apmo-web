import { ReactNode, useState, type ComponentProps } from 'react';

import { cn } from '@/shared/utils/cn';

const Input = ({
  className,
  label,
  value,
  onChange,
  error,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<'input'> & {
  label?: ReactNode;
  error?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isLabelFloating = isFocused || Boolean(value);

  const onFocused = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const onBlured = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={cn('relative', className)}>
      <label
        className={cn(
          'absolute left-[10px] text-a3-orange text-sm font-normal pointer-events-none font-[var(--font-roboto)] transition-all duration-200',
          isLabelFloating
            ? 'top-[-18px] left-0 translate-y-0'
            : 'top-1/2 -translate-y-1/2'
        )}
      >
        {label}
      </label>
      <input
        {...props}
        className="py-2.5 px-2 h-8 w-full bg-a3-black text-white border-none placeholder:text-a3-grey focus:outline-none"
        value={value}
        onChange={onChange}
        onFocus={onFocused}
        onBlur={onBlured}
      />
      {error && (
        <div className="absolute bottom-[-18px] right-0 text-[rgb(218,23,23)] text-sm z-[1]">
          {error}
        </div>
      )}
    </div>
  );
};

export { Input };
