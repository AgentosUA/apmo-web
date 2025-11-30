import { ReactNode, useState, type ComponentProps } from 'react';

import { cn } from '@/shared/utils/cn';

import styles from './ui.module.scss';

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

  const onFocused = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const onBlured = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={cn(styles.wrapper, className)}>
      {label && 
        <label
          className={cn(styles.label, {
            [styles.labelFocused]: isFocused || Boolean(value),
          })}>
          {label}
        </label>
      }
      <input
        {...props}
        className={cn(styles.input)}
        value={value}
        onChange={onChange}
        onFocus={onFocused}
        onBlur={onBlured}
      />
      {<div className={styles.error}>{error}</div>}
    </div>
  );
};

export { Input };
