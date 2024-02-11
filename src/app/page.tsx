import Image from 'next/image';

import styles from './page.module.scss';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.menu}></div>
        <div className={styles.logo}>
          <Image
            className={styles.logoImage}
            src='/a3-logo.png'
            width={159}
            height={91}
            alt='logo'
          />
          <h1 className={styles.title}>PLAN MAKER ONLINE</h1>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.navigation}>
          <Link href='/missions/create' className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/select-map.png'
              width={325}
              height={325}
              alt='Select map'
            />
            <p className={styles.navigationItemText}>Select Map</p>
          </Link>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/load-mission.png'
              width={325}
              height={325}
              alt='Load mission'
            />
            <p className={styles.navigationItemText}>Load mission</p>
          </div>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/changelog.png'
              width={325}
              height={325}
              alt='Changelog'
            />
            <p className={styles.navigationItemText}>Changelog</p>
          </div>
        </div>
      </main>
    </>
  );
}
