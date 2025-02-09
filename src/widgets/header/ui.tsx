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
  const [isScrolled, setIsScrolled] = useState(
    typeof window === 'undefined' ? 0 : window?.scrollY > 0
  );

  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onBurgerMenuClick = () => {
    setIsMenuOpened(!isMenuOpened);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window?.scrollY > 0);
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
          href='https://savelife.in.ua/en/donate-en/'
          target='_blank'>
          <Button variant='transparent'>
            <Localize translationKey='widgets:header:support' />
          </Button>
        </Link>
        <Link className={classNames(styles.menuItem)} href='/changelog'>
          <Button variant='transparent'>
            <Localize translationKey='widgets:header:changelog' />
          </Button>
        </Link>
        <div className={styles.forceRightElements} />
        <UnAuthorized>
          <Link className={styles.menuItem} href='/auth/login'>
            <Button size='md' variant='transparent'>
              <Localize translationKey='widgets:header:logIn' />
            </Button>
          </Link>
          <Link className={styles.menuItem} href='/auth/sign-up'>
            <Button variant='transparent'>
              <Localize translationKey='widgets:header:signUp' />
            </Button>
          </Link>
        </UnAuthorized>

        <Authorized>
          <Link className={styles.menuItem} href='/profile'>
            <Button size='md' variant='transparent'>
              <Localize translationKey='widgets:header:profile' />
            </Button>
          </Link>

          <Link className={styles.menuItem} href='/'>
            <Button size='md' variant='transparent' onClick={userEntity.logout}>
              <Localize translationKey='widgets:header:logOut' />
            </Button>
          </Link>
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
