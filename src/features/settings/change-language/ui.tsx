'use client';

import classNames from 'classnames';
import { FC, useState } from 'react';
import { MdOutlineLanguage } from 'react-icons/md';

import { Language } from '@/entities/settings/model';
import { useStore } from '@/entities/store';
import { Button } from '@/shared/ui/atoms/button';
import { Modal } from '@/shared/ui/moleculas/modal/ui';

const ChangeLanguage: FC<{
  className?: string;
}> = ({ className }) => {
  const {
    settings: { getLocale, setLocale },
  } = useStore();

  const locale = getLocale();
  const [currentLocale, setCurrentLocale] = useState(locale);

  const onConfirm = () => {
    setLocale(currentLocale);
  };

  const onCancel = () => {
    setCurrentLocale(getLocale());
  };

  const onLocaleClick = (locale: Language) => {
    setCurrentLocale(locale);
  };

  return (
    <Modal
      title='Change language'
      onConfirm={onConfirm}
      onCancel={onCancel}
      trigger={
        <MdOutlineLanguage
          className={classNames(
            'w-6 h-6 cursor-pointer fill-white hover:fill-a3-orange',
            className
          )}
        />
      }>
      <div className='flex flex-col gap-2 py-4 px-2'>
        <Button
          className={classNames({
            '!bg-a3-orange': currentLocale === Language.EN,
          })}
          onClick={() => onLocaleClick(Language.EN)}>
          English
        </Button>
        <Button
          className={classNames({
            '!bg-a3-orange': currentLocale === Language.CZ,
          })}
          onClick={() => onLocaleClick(Language.CZ)}>
          Čeština
        </Button>
        <Button
          className={classNames({
            '!bg-a3-orange': currentLocale === Language.UK,
          })}
          onClick={() => onLocaleClick(Language.UK)}>
          Українська
        </Button>
      </div>
    </Modal>
  );
};

export { ChangeLanguage };
