'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGoogle, FaSteam } from 'react-icons/fa';

import { userEntity } from '@/entities/user/model';
import { api, type AuthProvider } from '@/shared/sdk';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

const VtgIcon = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      'inline-flex items-center justify-center h-[1.15em] px-[0.2em] text-[0.62em] font-bold leading-none tracking-tight border border-current',
      className
    )}
  >
    VTG
  </span>
);

/** Icon and name of each sign-in method. */
const PROVIDERS: Record<AuthProvider, { name: string; icon: ReactNode }> = {
  google: { name: 'Google', icon: <FaGoogle aria-hidden /> },
  steam: { name: 'Steam', icon: <FaSteam aria-hidden /> },
  vtg: { name: 'VTG', icon: <VtgIcon /> },
};

const providerButtonClass =
  'relative flex items-center justify-center gap-2.5 h-10 w-full px-4 text-sm uppercase tracking-[0.06em] text-white bg-black/60 border border-solid border-white/15 hover:border-a3-orange hover:bg-black/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-a3-orange transition-colors';

/**
 * "Continue with Google / Steam / VTG". Plain links: the API redirects to the
 * provider and back to `/auth/callback`. Renders nothing when the server has
 * no external sign-in configured.
 */
const SocialLogin = observer(({ disabled }: { disabled?: boolean }) => {
  const { i18n } = useTranslation();
  const { providers } = userEntity;

  useEffect(() => {
    void userEntity.loadProviders();
  }, []);

  if (!providers?.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-white/40">
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <Localize translationKey="pages:auth:orContinueWith" />
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </div>
      <div
        className={cn(
          'grid gap-2',
          providers.length > 1 && 'tablet:grid-cols-[repeat(auto-fit,minmax(0,1fr))]'
        )}
      >
        {providers.map((provider) => (
          <a
            key={provider}
            href={api.auth.getOAuthLoginUrl(provider, i18n.language)}
            className={cn(providerButtonClass, disabled && 'pointer-events-none opacity-50')}
            aria-disabled={disabled}
          >
            <span className="text-base">{PROVIDERS[provider].icon}</span>
            {PROVIDERS[provider].name}
          </a>
        ))}
      </div>
    </div>
  );
});

export { PROVIDERS as AUTH_PROVIDER_META, SocialLogin, VtgIcon };
