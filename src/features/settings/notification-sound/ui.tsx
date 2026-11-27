'use client';

import { observer } from 'mobx-react-lite';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineVolumeOff, MdOutlineVolumeUp } from 'react-icons/md';

import { useStore } from '@/entities/store';
import { cn } from '@/shared/utils/cn';

/** Icon button in the footer that mutes / unmutes notification sounds. */
const NotificationSoundToggle: FC<{ className?: string }> = observer(({ className }) => {
  const { t } = useTranslation();
  const { settings } = useStore();

  const isEnabled = settings.isSoundEnabled;
  const Icon = isEnabled ? MdOutlineVolumeUp : MdOutlineVolumeOff;
  const label = t(
    isEnabled ? 'features:notificationSound:disable' : 'features:notificationSound:enable'
  );

  return (
    <button
      type="button"
      onClick={settings.toggleSound}
      aria-pressed={!isEnabled}
      aria-label={label}
      title={label}
      className={cn('group cursor-pointer focus-visible:outline-none', className)}
    >
      <Icon
        aria-hidden
        className="w-6 h-6 fill-white group-hover:fill-a3-orange group-focus-visible:fill-a3-orange"
      />
    </button>
  );
});

NotificationSoundToggle.displayName = 'NotificationSoundToggle';

/** Labeled on / off switch for the profile page. */
const NotificationSoundSetting: FC<{ className?: string }> = observer(({ className }) => {
  const { t } = useTranslation();
  const { settings } = useStore();

  const isEnabled = settings.isSoundEnabled;
  const Icon = isEnabled ? MdOutlineVolumeUp : MdOutlineVolumeOff;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      onClick={settings.toggleSound}
      className={cn(
        'group flex items-center justify-between gap-3 w-full px-3 py-2 border border-solid border-white/20 bg-white/[0.04] text-left transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:border-white',
        className
      )}
    >
      <span className="flex items-center gap-2 min-w-0">
        <Icon
          aria-hidden
          className={cn('w-5 h-5 shrink-0', isEnabled ? 'fill-white' : 'fill-white/50')}
        />
        <span className="flex flex-col min-w-0">
          <span className="text-sm uppercase tracking-[0.06em]">
            {t('features:notificationSound:label')}
          </span>
          <span className="text-xs text-white/55">
            {t(isEnabled ? 'features:notificationSound:on' : 'features:notificationSound:off')}
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          'relative shrink-0 w-10 h-5 border border-solid transition-colors',
          isEnabled ? 'border-a3-orange bg-a3-orange/30' : 'border-white/30 bg-white/5'
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] w-[14px] h-[14px] transition-all',
            isEnabled ? 'left-[22px] bg-a3-orange' : 'left-[2px] bg-white/60'
          )}
        />
      </span>
    </button>
  );
});

NotificationSoundSetting.displayName = 'NotificationSoundSetting';

export { NotificationSoundSetting, NotificationSoundToggle };
