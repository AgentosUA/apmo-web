import { useState, type ComponentProps } from 'react';

import classNames from 'classnames';

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
  label?: string;
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
    <div className={classNames(styles.wrapper, className)}>
      {
        <label
          className={classNames(styles.label, {
            [styles.labelFocused]: isFocused || Boolean(value),
          })}>
          {label}
        </label>
      }
      <input
        {...props}
        className={classNames(styles.input)}
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
