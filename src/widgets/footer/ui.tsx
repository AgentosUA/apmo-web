import { ChangeLanguage } from '@/features/settings/change-language/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';

import styles from './ui.module.scss';

const Footer = () => {
  return (
    <footer className='flex justify-between items-center bg-black/70 text-center gap-3 min-h-28'>
      
        
        <div>
        <ChangeLanguage className='absolute left-10 top-9' />
        </div>
      
        <div className='flex items-center gap-2 text-white w-full'>
      
        
        <Localize translationKey='widgets:footer:createdBy' />{' '}
        <span className='text-a3-orange'>Agentos</span> &{' '}
        <span className='text-a3-orange'>XDred</span>
      </div>
      <p className={styles.contribute}>
        <Localize translationKey='widgets:footer:feelFreeToContribute' />{' '}
        <a href='https://github.com/AgentosUA/apmo-web'>GitHub</a>
      </p>
    </footer>
  );
};

export { Footer };
