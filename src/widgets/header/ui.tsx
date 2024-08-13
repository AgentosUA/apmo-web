import { useEffect, useState } from 'react';

import Image from 'next/image';

import Link from 'next/link';

import { Button } from '@/shared/ui/atoms/button';

import styles from './ui.module.scss';
import classNames from 'classnames';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
    </header>
  );
};

export { Header };
