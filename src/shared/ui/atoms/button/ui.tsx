import classNames from 'classnames';
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

import styles from './ui.module.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'thick' | 'bold';
  size?: 'sm' | 'md' | 'lg';
};

const Button: FC<ButtonProps> = ({
  children,
  className,
  variant = 'thick',
  size = 'sm',
  ...props
}) => (
  <button
    {...props}
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
);

export { Button };
