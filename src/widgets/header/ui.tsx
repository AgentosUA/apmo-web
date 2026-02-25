'use client';

import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { RxHamburgerMenu } from 'react-icons/rx';

import { userEntity } from '@/entities/user/model';
import { Authorized, UnAuthorized } from '@/entities/user/ui/authorization/ui';
import { Button } from '@/shared/ui/atoms/button';
import { Localize } from '@/shared/ui/quarks/localize/ui';

import styles from './ui.module.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onBurgerMenuClick = () => {
    setIsMenuOpened((prev) => !prev);
  };

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
        'sticky top-0 z-20 max-lg:bg-black',
        isScrolled && 'shadow-sm'
      )}
    >
      {/* Mobile header bar */}
      <div className="flex items-center justify-between h-20 px-4 lg:hidden">
        <button
          type="button"
          onClick={onBurgerMenuClick}
          className="flex items-center justify-center text-white"
          aria-label="Toggle navigation"
        >
          {isMenuOpened ? (
            <IoMdClose className="text-2xl" />
          ) : (
            <RxHamburgerMenu className="text-2xl" />
          )}
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
            <div className="text-[10px] font-light">
              v{process.env.APP_VERSION}
            </div>
          </h1>
        </Link>

        {/* Spacer to balance the burger button */}
        <div className="w-6" />
      </div>

      {/* Desktop header + menu */}
      <div className="hidden lg:flex items-center justify-center h-24 relative">
        <div className="flex items-center w-full h-8 bg-black px-4">
          <Link
            className={styles.menuItem}
            href="https://savelife.in.ua/en/donate-en/"
            target="_blank"
          >
            <Button variant="primary">
              <Localize translationKey="widgets:header:support" />
            </Button>
          </Link>
          <Link className={classNames(styles.menuItem)} href="/changelog">
            <Button variant="primary">
              <Localize translationKey="widgets:header:changelog" />
            </Button>
          </Link>
          <Link className={classNames(styles.menuItem)} href="/licence">
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

            <Link href="/">
              <Button variant="primary" onClick={userEntity.logout}>
                <Localize translationKey="widgets:header:logOut" />
              </Button>
            </Link>
          </Authorized>
        </div>

        <div
          className={classNames(
            'absolute left-1/2 transform -translate-x-1/2 text-center duration-300 flex items-center z-10 justify-center',
            'top-[5px]',
            {
              ['top-[2px] text-[16px]']: isScrolled,
            }
          )}
        >
          <Link className="flex flex-col items-center" href="/">
            <Image
              className={classNames('duration-300 transition-all', {
                'flex items-center justify-center h-16 w-auto text-center mx-auto':
                  isScrolled,
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
              <div className="absolute -bottom-2.5 transform text-xs font-light left-0 right-0">
                v{process.env.APP_VERSION}
              </div>
            </h1>
          </Link>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {isMenuOpened && (
        <div className="fixed inset-x-0 top-20 bottom-0 bg-black flex flex-col items-center gap-4 px-4 pt-6 pb-8 overflow-y-auto lg:hidden">
          <Link
            href="https://savelife.in.ua/en/donate-en/"
            target="_blank"
            className="w-full"
          >
            <Button className="w-full" variant="primary">
              <Localize translationKey="widgets:header:support" />
            </Button>
          </Link>
          <Link href="/changelog" className="w-full">
            <Button className="w-full" variant="primary">
              <Localize translationKey="widgets:header:changelog" />
            </Button>
          </Link>
          <Link href="/licence" className="w-full">
            <Button className="w-full" variant="primary">
              <Localize translationKey="widgets:header:licence" />
            </Button>
          </Link>

          <UnAuthorized>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full" variant="primary">
                <Localize translationKey="widgets:header:logIn" />
              </Button>
            </Link>
            <Link href="/auth/sign-up" className="w-full">
              <Button className="w-full" variant="primary">
                <Localize translationKey="widgets:header:signUp" />
              </Button>
            </Link>
          </UnAuthorized>

          <Authorized>
            <Link href="/profile" className="w-full">
              <Button className="w-full" variant="primary">
                <Localize translationKey="widgets:header:profile" />
              </Button>
            </Link>

            <Link href="/" className="w-full">
              <Button
                className="w-full"
                variant="primary"
                onClick={userEntity.logout}
              >
                <Localize translationKey="widgets:header:logOut" />
              </Button>
            </Link>
          </Authorized>
        </div>
      )}
    </header>
  );
};

export { Header };

