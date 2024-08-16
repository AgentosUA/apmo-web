'use client';

import { observer } from 'mobx-react-lite';

import { Header } from '@/widgets/header';

import { Footer } from '@/widgets/footer';

import styles from './page.module.scss';
import Image from 'next/image';
import { userEntity } from '@/entities/user/model';
import { useEffect } from 'react';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { mapList } from '@/shared/data/map-list';
import { Button } from '@/shared/ui/atoms/button';

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
          <h2 className={styles.username}>{userEntity?.user?.username}</h2>
        </div>
        <div className={styles.plans}>
          <div className={styles.plansTitle}>My plans</div>
          {userEntity?.user?.plans?.map((item) => (
            <div key={item.id} className={styles.plan}>
              <Image src={item?.mission?.island} alt='island' />
              <h3>{item?.mission?.missionName}</h3>
              <div className={styles.planFooter}>
                <p>
                  {
                    mapList.find((map) => map.dir === item?.mission?.island)
                      ?.name
                  }
                </p>
                <div className={styles.planActions}>
                  <Button variant='bold'>View</Button>
                  <Button variant='bold'>Copy markers</Button>
                  <Button variant='red'>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default Profile;
