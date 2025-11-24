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
import { View } from '@/shared/ui/quarks/view';

import styles from './ui.module.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onBurgerMenuClick = () => {
    setIsMenuOpened(!isMenuOpened);
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
        'sticky top-0 flex items-center justify-center h-24 duration-300 z-10 max-md:overflow-visible max-md:bg-black',
        {
          ['duration-300 transition-all bg-black shadow-sm']: isScrolled,
        }
      )}
    >
      {isMenuOpened ? (
        <IoMdClose
          className="absolute top-1/2 left-4 text-[25px] z-[11] transform -translate-y-1/2 lg:hidden"
          color="#fff"
          onClick={onBurgerMenuClick}
        />
      ) : (
        <RxHamburgerMenu
          className="absolute top-1/2 left-4 text-[25px] z-[11] transform -translate-y-1/2 lg:hidden"
          color="#fff"
          onClick={onBurgerMenuClick}
        />
      )}

      <div
        className={classNames('flex flex-start items-center w-full h-8 bg-black px-4', {
          'left-0 transition-all left duration-300': isMenuOpened,
        })}
      >
        <Link
          className={styles.menuItem}
          href="https://savelife.in.ua/en/donate-en/"
          target="_blank"
        >
          <Button className="" variant="primary">
            <Localize translationKey="widgets:header:support" />
          </Button>
        </Link>
        <Link className={classNames(styles.menuItem)} href="/changelog">
          <Button className="" variant="primary">
            <Localize translationKey="widgets:header:changelog" />
          </Button>
        </Link>
        <Link className={classNames(styles.menuItem)} href="/licence">
          <Button className="" variant="primary">
            <Localize translationKey="widgets:header:licence" />
          </Button>
        </Link>
        <div className="grow-[1]" />
        <UnAuthorized>
          <Link className="max-lg:text-center max-lg:w-full" href="/auth/login">
            <Button className="text-center w-full " variant="primary">
              <Localize translationKey="widgets:header:logIn" />
            </Button>
          </Link>
          <Link className="max-lg:text-center max-lg:w-full" href="/auth/sign-up">
            <Button className="text-center w-full " variant="primary">
              <Localize translationKey="widgets:header:signUp" />
            </Button>
          </Link>
        </UnAuthorized>

        <Authorized>
          <Link className="max-lg:text-center max-lg:w-full" href="/profile">
            <Button className="" size="md" variant="primary">
              <Localize translationKey="widgets:header:profile" />
            </Button>
          </Link>

          <Link className="max-lg:text-center max-lg:w-full" href="/">
            <Button className="" size="md" variant="primary" onClick={userEntity.logout}>
              <Localize translationKey="widgets:header:logOut" />
            </Button>
          </Link>
        </Authorized>
      </div>
      <div
        className={classNames(
          'absolute top-[5px] left-1/2 transform -translate-x-1/2 text-center duration-300 flex items-center z-10 justify-center',
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
              'mt-[-3px] text-[20px] font-medium text-white text-center transition duration-300 mx-auto',
              {
                'text-[16px]': isScrolled,
              }
            )}
          >
            PLAN MAKER ONLINE
          </h1>
        </Link>
      </div>
    </header>
  );
};

export { Header };
