import { ChangeLanguage } from '@/features/settings/change-language/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';

import styles from './ui.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <ChangeLanguage className='absolute left-10 top-9' />
      <p className={styles.authors}>
        <Localize translationKey='widgets:footer:createdBy' />{' '}
        <span className={styles.author}>Agentos</span> &{' '}
        <span className={styles.author}>XDred</span>
      </p>
      <p className={styles.contribute}>
        <Localize translationKey='widgets:footer:feelFreeToContribute' />{' '}
        <a href='https://github.com/AgentosUA/apmo-web'>GitHub</a>
      </p>
    </footer>
  );
};

export { Footer };
