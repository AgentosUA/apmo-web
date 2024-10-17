'use client';

import Image from 'next/image';

import styles from './page.module.scss';
import { observer } from 'mobx-react-lite';

import { useRouter } from 'next/navigation';

import { Post } from '@/entities/post/ui';
import { Button } from '@/shared/ui/atoms/button';
import Link from 'next/link';
import { Header } from '@/widgets/header';
import { useBreakpoint } from '@/shared/ui/quarks/view';

const ChangelogPage = observer(() => {
  const router = useRouter();

  const { isDesktop } = useBreakpoint();

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <Link className={styles.homeLink} href='/'>
          <Button>Back to home page</Button>
        </Link>
        <div className={styles.posts}>
          <Post title='[1.0.0-RC1] Version release' date='05.09.2024'>
            <iframe
              width='100%'
              height={isDesktop ? '512px' : '100%'}
              src='https://www.youtube.com/embed/rR1S-dNhvOo?si=adyZ3wh_Yv3fMXwy'
              title='YouTube video player'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen></iframe>
          </Post>
          <Post
            title='UPDATE: New maps & marker support'
            date='06.20.2024'
            imageUrl='/preview.jpg'>
            <p>List of changes:</p>
            <ul>
              <li>
                The display of linear and rectangular zone markers has been
                added in the test mode
              </li>
              <li>Map load & move optimization (1 layer instead of 7)</li>
              <li>
                <b>New maps:</b> Korsac, Farabad, Isla Pera, Hellanmaa, Kunduz
                River, North Takistan, Livonia
              </li>
            </ul>
            <br />
            During the usage of APMO you may occur some bugs, so feel free to
            inform us on WOG Forum or via{' '}
            <Link href='https://github.com/AgentosUA/apmo-web/issues'>
              GitHub issues
            </Link>
            .
          </Post>
          <Post
            title='APMO Beta Release [MVP]'
            date='05.11.2024'
            imageUrl='/preview.jpg'>
            <b>Welcome to APMO: Arma Plan Maker Online!</b>
            <br />
            We are happy to inform you that our project are now open for beta
            testing!
            <br />
            While working on the 1.0 release version, there some features that
            now available for you:
            <ul>
              <li>Select one of 40 maps for your plan</li>
              <li>
                Upload any .pbo mission from Arma 3, view briefing, slots,
                vehicles & custom structures
              </li>
              <li>Copy & Paste SWT markers from Arma 3</li>
              <li>Move/Create/Delete basic SWT Markers</li>
              <li>Save plans & share it with your team</li>
            </ul>
            <br />
            During the usage of APMO you may occur some bugs, so feel free to
            inform us on WOG Forum or via{' '}
            <Link href='https://github.com/AgentosUA/apmo-web/issues'>
              GitHub issues
            </Link>
            .
          </Post>
        </div>
      </div>
    </>
  );
});

export default ChangelogPage;
