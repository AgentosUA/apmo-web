'use client';

import { useEffect, useState } from 'react';

import { RxHamburgerMenu } from 'react-icons/rx';

import Image from 'next/image';

import Link from 'next/link';

import { Button } from '@/shared/ui/atoms/button';

import { Authorized, UnAuthorized } from '@/entities/user/ui/authorization/ui';

import { IoMdClose } from 'react-icons/io';

import classNames from 'classnames';

import { userEntity } from '@/entities/user/model';

import { View } from '@/shared/ui/quarks/view';

import styles from './ui.module.scss';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(
    typeof window === 'undefined' ? 0 : window.scrollY > 0
  );

  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onBurgerMenuClick = () => {
    setIsMenuOpened(!isMenuOpened);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={classNames(styles.header, {
        [styles.scrolledHeader]: isScrolled,
      })}>
      <View.Tablet>
        {isMenuOpened ? (
          <IoMdClose
            className={styles.closeIcon}
            color='#fff'
            onClick={onBurgerMenuClick}
          />
        ) : (
          <RxHamburgerMenu
            className={styles.burgerIcon}
            color='#fff'
            onClick={onBurgerMenuClick}
          />
        )}
      </View.Tablet>
      <div
        className={classNames(styles.menu, {
          [styles.menuOpened]: isMenuOpened,
        })}>
        <Link
          className={styles.menuItem}
          href='https://savelife.in.ua/'
          target='_blank'>
          <Button variant='transparent'>SUPPORT</Button>
        </Link>
        <Link
          className={classNames(styles.menuItem, styles.forceRightElements)}
          href='/changelog'>
          <Button variant='transparent'>Changelog</Button>
        </Link>
        <UnAuthorized>
          <Link href='/auth/login'>
            <Button className={styles.menuItem} size='md' variant='transparent'>
              LOG IN
            </Button>
          </Link>
          <Link className={styles.menuItem} href='/auth/sign-up'>
            <Button variant='transparent'>SIGN UP</Button>
          </Link>
        </UnAuthorized>

        <Authorized>
          <Link className={styles.menuItem} href='/profile'>
            <Button size='md' variant='transparent'>
              Profile
            </Button>
          </Link>

          <Button
            className={styles.menuItem}
            size='md'
            variant='transparent'
            onClick={userEntity.logout}>
            Log out
          </Button>
        </Authorized>
      </div>
      <div className={styles.logo}>
        <Link href='/'>
          <Image
            className={styles.logoImage}
            src='/a3-logo.png'
            width={159}
            height={91}
            alt='logo'
          />
          <h1 className={styles.title}>PLAN MAKER ONLINE</h1>
        </Link>
      </div>
    </header>
  );
};

export { Header };
