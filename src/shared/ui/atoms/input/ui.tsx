import type { ComponentProps } from 'react';

import classNames from 'classnames';

import styles from './ui.module.scss';

const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input {...props} className={classNames(styles.input, className)} />
);

export { Input };
