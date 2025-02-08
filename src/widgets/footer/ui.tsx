import { ChangeLanguage } from '@/features/settings/language/ui';

import styles from './ui.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p className={styles.authors}>
        Created by <span className={styles.author}>Agentos</span> &{' '}
        <span className={styles.author}>XDred</span>
      </p>
      <p className={styles.contribute}>
        Feel free to contribute on{' '}
        <a href='https://github.com/AgentosUA/apmo-web'>GitHub</a>
      </p>
      <ChangeLanguage className='absolute right-6 top-10' />
    </footer>
  );
};

export { Footer };
