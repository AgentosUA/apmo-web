import Image from 'next/image';

import styles from './page.module.scss';

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <Image
          className={styles.logo}
          src='/a3-logo.png'
          width={159}
          height={91}
          alt='logo'
        />
      </header>
      <main className={styles.main}>
        <div className={styles.navigation}>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/select-map.png'
              width={160}
              height={162}
              alt='Select map'
            />
            <p className={styles.navigationItemText}>Select Map</p>
          </div>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/load-mission.png'
              width={160}
              height={162}
              alt='Load mission'
            />
            <p className={styles.navigationItemText}>Load mission</p>
          </div>
          <div className={styles.navigationItem}>
            <Image
              className={styles.navigationItemImage}
              src='/changelog.png'
              width={160}
              height={162}
              alt='Changelog'
            />
            <p className={styles.navigationItemText}>Changelog</p>
          </div>
        </div>
      </main>
    </>
  );
}
