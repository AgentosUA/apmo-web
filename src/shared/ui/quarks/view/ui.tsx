import { FC, PropsWithChildren } from 'react';

const Condition: FC<
  PropsWithChildren<{
    if: boolean;
  }>
> = ({ if: condition, children }) => {
  if (!condition) return null;

  return children;
};

const View = {
  Condition,
};

export { View };
