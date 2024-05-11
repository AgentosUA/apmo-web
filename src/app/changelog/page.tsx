'use client';

import Image from 'next/image';

import styles from './page.module.scss';
import { observer } from 'mobx-react-lite';

import { useRouter } from 'next/navigation';

import { Post } from '@/entities/post/ui';
import { Button } from '@/shared/ui/atoms/button';
import Link from 'next/link';

const ChangelogPage = observer(() => {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <Link className={styles.homeLink} href='/'>
        <Button>Back to home page</Button>
      </Link>
      <Post
        title='APMO Beta Release [MVP]'
        date='05.11.2024'
        imageUrl='/preview.jpg'>
        <b>Welcome to APMO: Arma Plan Maker Online!</b>
        <br />
        We are happy to inform you that our project now are open for beta
        testing!
        <br />
        While working on the 1.0 release version, there some features that now
        available for you:
        <ul>
          <li>Select one of 40 maps for your plan</li>
          <li>
            Upload any .pbo mission from Arma 3, view briefing, slots, vehicles
            & custom structures
          </li>
          <li>Copy & Paste SWT markers from Arma 3</li>
          <li>Move/Create/Delete basic SWT Markers</li>
          <li>Save plans & share it with your team</li>
        </ul>
        <br />
        During the usage of APMO you may occur some bugs, so feel free to inform
        us on WOG Forum or via{' '}
        <Link href='https://github.com/AgentosUA/apmo-web/issues'>
          GitHub issues
        </Link>
        .
      </Post>
    </div>
  );
});

export default ChangelogPage;
