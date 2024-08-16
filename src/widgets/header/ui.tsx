'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import Link from 'next/link';

import { Button } from '@/shared/ui/atoms/button';

import { Authorized, UnAuthorized } from '@/entities/user/ui/authorization/ui';

import classNames from 'classnames';

import styles from './ui.module.scss';
import { userEntity } from '@/entities/user/model';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(
    (typeof window === 'undefined' ? 0 : window.scrollY) > 0
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
      <div className={styles.menu}>
        <Link href='https://savelife.in.ua/' target='_blank'>
          <Button className={styles.menuItem} variant='transparent'>
            SUPPORT
          </Button>
        </Link>
        <Link href='/changelog'>
          <Button className={styles.menuItem} variant='transparent'>
            Changelog
          </Button>
        </Link>
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
      <UnAuthorized>
        <div className={styles.menu}>
          <Link href='/auth/login'>
            <Button className={styles.menuItem} size='md' variant='transparent'>
              LOG IN
            </Button>
          </Link>
          <Link href='/auth/sign-up'>
            <Button className={styles.menuItem} variant='transparent'>
              SIGN UP
            </Button>
          </Link>
        </div>
      </UnAuthorized>

      <Authorized>
        <div className={styles.menu}>
          <Link href='/profile'>
            <Button className={styles.menuItem} size='md' variant='transparent'>
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
        </div>
      </Authorized>
    </header>
  );
};

export { Header };
