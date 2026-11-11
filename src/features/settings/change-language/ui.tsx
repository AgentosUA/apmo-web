'use client';

import classNames from 'classnames';
import { FC, SVGProps, useEffect, useState } from 'react';
import { MdOutlineLanguage } from 'react-icons/md';

import { Language } from '@/entities/settings/model';
import { useStore } from '@/entities/store';
import { FlagCZ, FlagGB, FlagUA } from '@/shared/ui/atoms/flag';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { cn } from '@/shared/utils/cn';

const LANGUAGES: { id: Language; label: string; Flag: FC<SVGProps<SVGSVGElement>> }[] = [
  { id: Language.EN, label: 'English', Flag: FlagGB },
  { id: Language.CZ, label: 'Čeština', Flag: FlagCZ },
  { id: Language.UK, label: 'Українська', Flag: FlagUA },
];

const TITLE = 'Language / Jazyk / Мова';

const LanguageTiles: FC<{
  value: Language;
  onChange: (locale: Language) => void;
}> = ({ value, onChange }) => (
  <div role="radiogroup" className="grid grid-cols-3 gap-3 px-4 pt-5 pb-9 mobile:gap-2 mobile:px-3">
    {LANGUAGES.map(({ id, label, Flag }) => {
      const isActive = value === id;

      return (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(id)}
          className={cn(
            'group flex flex-col items-center justify-center gap-3 aspect-square p-2 border-2 bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:border-white',
            isActive
              ? 'border-a3-orange bg-a3-orange/20'
              : 'border-white/15 hover:border-white/60 hover:bg-white/10'
          )}
        >
          <Flag
            aria-hidden
            className={cn(
              'w-[72%] aspect-[3/2] shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:scale-105',
              !isActive && 'opacity-80 group-hover:opacity-100'
            )}
          />
          <span
            className={cn(
              'text-sm uppercase tracking-wide text-white mobile:text-xs',
              isActive ? 'font-medium' : 'font-normal text-white/80'
            )}
          >
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

/** Language switcher in the footer. */
const ChangeLanguage: FC<{
  className?: string;
}> = ({ className }) => {
  const {
    settings: { getLocale, setLocale },
  } = useStore();

  const [currentLocale, setCurrentLocale] = useState(getLocale);

  return (
    <Modal
      title={TITLE}
      onConfirm={() => setLocale(currentLocale)}
      onCancel={() => setCurrentLocale(getLocale())}
      onOpenChange={(open) => open && setCurrentLocale(getLocale())}
      trigger={
        <MdOutlineLanguage
          className={classNames(
            'w-6 h-6 cursor-pointer fill-white hover:fill-a3-orange',
            className
          )}
        />
      }
    >
      <LanguageTiles value={currentLocale} onChange={setCurrentLocale} />
    </Modal>
  );
};

const detectBrowserLocale = (): Language => {
  const langs =
    typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);

  for (const lang of langs) {
    const code = lang.toLowerCase().split('-')[0];
    if (code === 'uk') return Language.UK;
    if (code === 'cs' || code === 'cz') return Language.CZ;
    if (code === 'en') return Language.EN;
  }

  return Language.EN;
};

/**
 * Opens the language picker on start when the user hasn't chosen a language yet
 * (nothing in cookie / localStorage). Closing it in any way saves the selection.
 */
const LanguageOnboarding: FC = () => {
  const { settings } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState(settings.getLocale);

  useEffect(() => {
    if (settings.restoreSavedLocale()) return;

    setCurrentLocale(detectBrowserLocale());
    setIsOpen(true);
  }, [settings]);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) settings.setLocale(currentLocale);
  };

  return (
    <Modal title={TITLE} open={isOpen} onOpenChange={onOpenChange} onConfirm={() => {}}>
      <LanguageTiles value={currentLocale} onChange={setCurrentLocale} />
    </Modal>
  );
};

export { ChangeLanguage, LanguageOnboarding };
