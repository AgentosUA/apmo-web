'use client';

import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ComponentPropsWithoutRef,
  ComponentType,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  FiFileText,
  FiHeart,
  FiLogIn,
  FiLogOut,
  FiRefreshCw,
  FiUser,
  FiUserPlus,
} from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { RxHamburgerMenu } from 'react-icons/rx';

import { Authorized, UnAuthorized } from '@/entities/user/ui/authorization/ui';
import { LogoutConfirm } from '@/features/user/logout';
import { Button } from '@/shared/ui/atoms/button';
import { useMounted } from '@/shared/ui/hooks';
import { Localize } from '@/shared/ui/quarks/localize/ui';

const MENU_ITEM_CLASS =
  'group flex items-center gap-3 w-full h-12 px-4 text-sm uppercase font-normal text-white! border-l-2 border-transparent transition-colors hover:bg-white/5 hover:border-a3-orange active:bg-a3-orange/20';

const MenuLink = ({
  href,
  icon: Icon,
  external,
  onClick,
  children,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <Link
    href={href}
    onClick={onClick}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    className={MENU_ITEM_CLASS}
  >
    <Icon className="text-lg text-white/70 group-hover:text-a3-orange" />
    {children}
  </Link>
);

const MenuButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> & { icon: ComponentType<{ className?: string }> }
>(({ icon: Icon, children, className, ...props }, ref) => (
  <button ref={ref} type="button" className={classNames(MENU_ITEM_CLASS, className)} {...props}>
    <Icon className="text-lg text-white/70 group-hover:text-a3-orange" />
    {children}
  </button>
));

MenuButton.displayName = 'MenuButton';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const pathname = usePathname();
  const isMounted = useMounted();

  const openMenu = () => setIsMenuOpened(true);
  const closeMenu = () => setIsMenuOpened(false);

  // Close the drawer on navigation.
  useEffect(() => {
    setIsMenuOpened(false);
  }, [pathname]);

  // Esc closes the drawer; lock page scroll while it's open.
  useEffect(() => {
    if (!isMenuOpened) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpened(false);
    };
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpened]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window?.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={classNames(
        'sticky top-0 z-20 max-lg:bg-black transition-colors duration-300',
        isScrolled && 'shadow-xs bg-black transition-colors duration-300'
      )}
    >
      {/* Mobile header bar */}
      <div className="flex items-center justify-between h-20 px-4 lg:hidden">
        <button
          type="button"
          onClick={openMenu}
          className="flex items-center justify-center w-10 h-10 -ml-2 text-white hover:text-a3-orange"
          aria-label="Open navigation"
          aria-expanded={isMenuOpened}
          aria-controls="mobile-menu"
        >
          <RxHamburgerMenu className="text-2xl" />
        </button>

        <Link className="flex flex-col items-center" href="/">
          <Image
            className="h-8 w-auto mx-auto"
            src="/a3-logo.png"
            width={159}
            height={91}
            alt="logo"
          />
          <h1 className="mt-[-2px] text-xs font-medium text-white text-center leading-tight">
            PLAN MAKER ONLINE
            <div className="text-[10px] font-light">v{process.env.APP_VERSION}</div>
          </h1>
        </Link>

        {/* Spacer to balance the burger button */}
        <div className="w-10" />
      </div>

      {/* Desktop header + menu */}
      <div className="hidden lg:flex items-center justify-center h-24 relative">
        <div className="flex items-center w-full h-8 bg-black px-4">
          <Link href="https://savelife.in.ua/en/donate-en/" target="_blank">
            <Button variant="primary">
              <Localize translationKey="widgets:header:support" />
            </Button>
          </Link>
          <Link href="/changelog">
            <Button variant="primary">
              <Localize translationKey="widgets:header:changelog" />
            </Button>
          </Link>
          <Link href="/licence">
            <Button variant="primary">
              <Localize translationKey="widgets:header:licence" />
            </Button>
          </Link>
          <div className="grow" />
          <UnAuthorized>
            <Link href="/auth/login">
              <Button variant="primary">
                <Localize translationKey="widgets:header:logIn" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="primary">
                <Localize translationKey="widgets:header:signUp" />
              </Button>
            </Link>
          </UnAuthorized>

          <Authorized>
            <Link href="/profile">
              <Button variant="primary">
                <Localize translationKey="widgets:header:profile" />
              </Button>
            </Link>

            <LogoutConfirm
              trigger={
                <Button variant="primary">
                  <Localize translationKey="widgets:header:logOut" />
                </Button>
              }
            />
          </Authorized>
        </div>

        <div
          className={classNames(
            'absolute left-1/2 -translate-x-1/2 text-center duration-300 flex items-center z-10 justify-center',
            'top-[5px]',
            {
              ['top-[2px] text-[16px]']: isScrolled,
            }
          )}
        >
          <Link className="flex flex-col items-center" href="/">
            <Image
              className={classNames('duration-300 transition-all', {
                'flex items-center justify-center h-16 w-auto text-center mx-auto': isScrolled,
              })}
              src="/a3-logo.png"
              width={159}
              height={91}
              alt="logo"
            />
            <h1
              className={classNames(
                'relative mt-[-3px] text-[20px] font-medium text-white text-center transition duration-300 mx-auto',
                {
                  'text-sm': isScrolled,
                }
              )}
            >
              PLAN MAKER ONLINE
              <div className="absolute -bottom-2.5 text-xs font-light left-0 right-0">
                v{process.env.APP_VERSION}
              </div>
            </h1>
          </Link>
        </div>
      </div>

      {/* Mobile side drawer: portalled to <body> so it sits above any page overlay; always mounted to animate in/out */}
      {isMounted &&
        createPortal(
          <div
            className={classNames(
              'fixed inset-0 z-[1050] lg:hidden',
              isMenuOpened ? 'pointer-events-auto' : 'pointer-events-none'
            )}
            aria-hidden={!isMenuOpened}
            inert={!isMenuOpened}
          >
            <div
              className={classNames(
                'absolute inset-0 bg-black/60 transition-opacity duration-300',
                isMenuOpened ? 'opacity-100' : 'opacity-0'
              )}
              onClick={closeMenu}
            />

            <nav
              id="mobile-menu"
              aria-label="Main"
              className={classNames(
                'absolute inset-y-0 left-0 flex flex-col w-[82vw] max-w-[320px] bg-a3-black border-r border-white/15 shadow-[8px_0_30px_rgba(0,0,0,0.6)]',
                'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
                isMenuOpened ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
                <Link className="flex items-center gap-3" href="/" onClick={closeMenu}>
                  <Image
                    className="h-8 w-auto"
                    src="/a3-logo.png"
                    width={159}
                    height={91}
                    alt="logo"
                  />
                  <span className="text-xs font-medium text-white leading-tight">
                    PLAN MAKER ONLINE
                    <span className="block text-[10px] font-light">v{process.env.APP_VERSION}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex items-center justify-center w-10 h-10 -mr-2 text-white hover:text-a3-orange"
                  aria-label="Close navigation"
                >
                  <IoMdClose className="text-2xl" />
                </button>
              </div>

              <div className="flex flex-col flex-1 overflow-y-auto py-3">
                <MenuLink
                  href="https://savelife.in.ua/en/donate-en/"
                  external
                  icon={FiHeart}
                  onClick={closeMenu}
                >
                  <Localize translationKey="widgets:header:support" />
                </MenuLink>
                <MenuLink href="/changelog" icon={FiRefreshCw} onClick={closeMenu}>
                  <Localize translationKey="widgets:header:changelog" />
                </MenuLink>
                <MenuLink href="/licence" icon={FiFileText} onClick={closeMenu}>
                  <Localize translationKey="widgets:header:licence" />
                </MenuLink>

                <div className="my-3 mx-4 border-t border-white/10" />

                <UnAuthorized>
                  <MenuLink href="/auth/login" icon={FiLogIn} onClick={closeMenu}>
                    <Localize translationKey="widgets:header:logIn" />
                  </MenuLink>
                  <MenuLink href="/auth/sign-up" icon={FiUserPlus} onClick={closeMenu}>
                    <Localize translationKey="widgets:header:signUp" />
                  </MenuLink>
                </UnAuthorized>

                <Authorized>
                  <MenuLink href="/profile" icon={FiUser} onClick={closeMenu}>
                    <Localize translationKey="widgets:header:profile" />
                  </MenuLink>
                  <LogoutConfirm
                    trigger={
                      // Close the drawer so the dialog is not covered by it.
                      <MenuButton icon={FiLogOut} onClick={closeMenu}>
                        <Localize translationKey="widgets:header:logOut" />
                      </MenuButton>
                    }
                  />
                </Authorized>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
};

export { Header };
