/* eslint-disable react/display-name */
import cx from 'classnames';

import type { ComponentProps, ReactHTML } from 'react';

import { createElement } from 'react';

const styled =
  <P extends keyof ReactHTML>(name: P, className = '') =>
  ({
    className: _className,
    ...props
  }: ComponentProps<ReactHTML[P]> & { className?: string }) =>
    createElement(name, {
      className: cx(className, _className),
      ...props,
    });

export { styled };
