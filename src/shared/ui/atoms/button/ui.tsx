import classNames from 'classnames';
import { ButtonHTMLAttributes, FC, PropsWithChildren, forwardRef } from 'react';

import styles from './ui.module.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'thick' | 'bold' | 'transparent' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'thick', size = 'sm', ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      className={classNames(
        styles.button,
        {
          [styles[variant]]: variant,
          [styles[size]]: size,
        },
        className
      )}>
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export { Button };
