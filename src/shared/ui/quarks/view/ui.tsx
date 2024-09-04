'use client';

import { FC, PropsWithChildren, useEffect, useState } from 'react';

const mobileBreakpoint = 600;
const tabletBreakpoint = 1199;

const Condition: FC<
  PropsWithChildren<{
    if: boolean;
  }>
> = ({ if: condition, children }) => {
  if (!condition) return null;

  return children;
};

const Tablet: FC<
  PropsWithChildren<{
    only?: boolean;
  }>
> = ({ children, only = false }) => {
  const width = useWindowWidth();

  return (
    <Condition
      if={
        width <= tabletBreakpoint &&
        (!only || (only && width <= mobileBreakpoint))
      }>
      {children}
    </Condition>
  );
};

const Mobile: FC<PropsWithChildren<{}>> = ({ children }) => {
  const width = useWindowWidth();

  return <Condition if={width <= mobileBreakpoint}>{children}</Condition>;
};

const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window === 'undefined' ? 1200 : window?.innerWidth
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWidth(width);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

const useBreakpoint = () => {
  const width = useWindowWidth();
  const isMobile = width <= mobileBreakpoint;
  const isTablet = width <= tabletBreakpoint;
  const isDesktop = width > tabletBreakpoint;

  return { isDesktop, isMobile, isTablet };
};

const View = {
  Condition,
  Mobile,
  Tablet,
};

export { View, useBreakpoint };
