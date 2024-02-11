import classNames from 'classnames';
import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

import styles from './ui.module.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg';
};

const Button: FC<ButtonProps> = ({
  children,
  className,
  size = 'sm',
  ...props
}) => (
  <button
    {...props}
    className={classNames(
      styles.button,
      {
        [styles[size]]: size,
      },
      className
    )}>
    {children}
  </button>
);

export { Button };
