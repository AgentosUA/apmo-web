import { FC, PropsWithChildren, ReactNode, useState } from 'react';

import { MdArrowBackIosNew } from 'react-icons/md';

import { cn } from '@/shared/utils/cn';

const useMenu = (items: Record<string, boolean>) => {
  const [active, setActive] = useState(items);

  const onMenuItemClick = (...keys: (keyof typeof active)[]) => {
    const item = { ...active };
    Object.keys(item).forEach((k) => {
      item[k as keyof typeof active] = false;
    });

    const activated = {} as Record<string, boolean>;

    keys.forEach((key) => {
      activated[key] = true;
    });

    setActive({
      ...item,
      ...activated,
    });
  };

  return {
    onMenuItemClick,
    active,
    setActive,
  };
};

const Header: FC<{
  title?: string;
  rightCorner?: ReactNode;
  onBack?: () => void;
}> = ({ title = '', rightCorner = '', onBack }) => (
  <div className="top-0 left-0 fixed w-full h-[30px] bg-gradient-to-b from-[#3C3C3C] to-[#1A1A1A] z-[400] flex items-center">
    <MdArrowBackIosNew
      className="ml-[5px] hover:cursor-pointer"
      onClick={onBack}
      color="#fff"
    />
    <h1 className="ml-[5px] text-[#FAFAFA] font-light text-xl leading-[30px]">
      {title}
    </h1>
    <div className="ml-auto">{rightCorner}</div>
  </div>
);

const MenuWrapper: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ className, children }) => (
  <div
    className={cn(
      'absolute top-10 left-5 right-5 flex items-start gap-[5px] max-w-[calc(100vw-20px)] max-h-[calc(100vh-20px)] z-[1000] pointer-events-none',
      'tablet:top-[35px] tablet:left-[5px] tablet:right-[5px] tablet:max-w-none tablet:max-h-[calc(100vh-35px)] tablet:overflow-hidden tablet:flex-wrap',
      className
    )}
  >
    {children}
  </div>
);

const MenuItem: FC<
  PropsWithChildren<{
    onClick?: () => void;
    isActive?: boolean;
  }>
> = ({ children, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      'flex items-center py-px px-2.5 text-[#FAFAFA] transition-all duration-300',
      isActive && 'bg-white/20',
      onClick && 'cursor-pointer hover:bg-white/20'
    )}
  >
    {children}
  </div>
);

const menuVariants = {
  primary: 'min-w-[140px] tablet:w-full',
  secondary:
    'min-w-[230px] max-h-[calc(100svh-110px)] overflow-y-auto mb-5 tablet:mb-auto tablet:w-full tablet:last:max-h-[250px] tablet:last:overflow-y-auto',
};

const Menu: FC<
  PropsWithChildren<{
    className?: string;
    variant?: 'primary' | 'secondary';
  }>
> = ({ className, children, variant = 'primary' }) => (
  <div
    className={cn(
      'py-2.5 min-w-[122px] bg-a3-surface pointer-events-auto',
      menuVariants[variant],
      className
    )}
  >
    {children}
  </div>
);

const Content: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const Overlay = {
  Header,
  MenuWrapper,
  Menu,
  MenuItem,
  Content,
};

export { Overlay, useMenu };
