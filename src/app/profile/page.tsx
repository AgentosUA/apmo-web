'use client';

import { observer } from 'mobx-react-lite';

import { Header } from '@/widgets/header';

import { Footer } from '@/widgets/footer';

import styles from './page.module.scss';
import Image from 'next/image';
import { userEntity } from '@/entities/user/model';
import { useEffect } from 'react';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';

const Profile = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <div className={styles.user}>
          <Image width={250} height={250} src='/avatar.jpg' alt='avatar' />
          <h2>{userEntity?.user?.username}</h2>
        </div>
        <div className={styles.plans}>
          <div />
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default Profile;
