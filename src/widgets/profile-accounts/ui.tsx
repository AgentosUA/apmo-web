'use client';

import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiKey, FiMail } from 'react-icons/fi';

import { userEntity } from '@/entities/user/model';
import { AUTH_PROVIDER_META } from '@/features/user/social-login';
import { AUTH_PROVIDERS, getApiErrorMessage, type AuthProvider } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

const MethodRow = ({
  icon,
  title,
  details,
  active,
  action,
}: {
  icon: ReactNode;
  title: ReactNode;
  details: ReactNode;
  active: boolean;
  action?: ReactNode;
}) => (
  <li
    className={cn(
      'flex flex-col gap-3 p-3 border border-solid tablet:flex-row tablet:items-center',
      active ? 'border-white/20 bg-white/[0.04]' : 'border-white/10'
    )}
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <span
        className={cn(
          'h-10 w-10 shrink-0 flex items-center justify-center text-lg border border-solid',
          active ? 'border-a3-orange text-white bg-a3-orange/15' : 'border-white/15 text-white/50'
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm uppercase tracking-[0.06em]">
          {title}
          {active && <FiCheck className="text-[#3ccf3c]" aria-hidden />}
        </p>
        <p className="text-xs text-white/55 truncate">{details}</p>
      </div>
    </div>
    {action && <div className="shrink-0 tablet:w-[150px] [&_button]:w-full">{action}</div>}
  </li>
);

/** Password and linked Google / Steam / VTG accounts. */
const ProfileAccounts = observer(() => {
  const { t, i18n } = useTranslation();
  const { user, providers, pendingProvider } = userEntity;

  useEffect(() => {
    void userEntity.loadProviders();
  }, []);

  if (!user) return null;

  const accounts = user.accounts ?? [];
  const hasPassword = user.hasPassword !== false;
  const methodsCount = accounts.length + (hasPassword ? 1 : 0);

  // Configured providers plus linked ones that were switched off on the server.
  const shown = AUTH_PROVIDERS.filter(
    (provider) =>
      providers?.includes(provider) || accounts.some((account) => account.provider === provider)
  );

  const onLink = async (provider: AuthProvider) => {
    try {
      await userEntity.linkProvider(provider, i18n.language);
    } catch (error) {
      toasterEntity.call({
        title: 'pages:profile:accounts:linkFailed',
        description: getApiErrorMessage(error),
      });
    }
  };

  const onUnlink = async (provider: AuthProvider) => {
    try {
      await userEntity.unlinkProvider(provider);

      toasterEntity.call({
        title: 'pages:profile:accounts:unlinkedTitle',
        description: AUTH_PROVIDER_META[provider].name,
      });
    } catch (error) {
      toasterEntity.call({
        title: 'pages:profile:accounts:unlinkFailed',
        description: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium uppercase">
          <Localize translationKey="pages:profile:accounts:title" />
        </h2>
        <p className="text-sm text-white/60">
          <Localize translationKey="pages:profile:accounts:description" />
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        <MethodRow
          icon={<FiMail aria-hidden />}
          title={<Localize translationKey="pages:auth:email" />}
          details={user.email || <Localize translationKey="pages:profile:accounts:noEmail" />}
          active={Boolean(user.email)}
        />

        <MethodRow
          icon={<FiKey aria-hidden />}
          title={<Localize translationKey="pages:auth:password" />}
          details={
            <Localize
              translationKey={
                hasPassword
                  ? 'pages:profile:accounts:passwordSet'
                  : 'pages:profile:accounts:passwordNotSet'
              }
            />
          }
          active={hasPassword}
          action={
            <Link href="/profile/change-password">
              <Button variant="orange">
                <Localize
                  translationKey={
                    hasPassword ? 'pages:profile:changePassword' : 'pages:profile:setPassword'
                  }
                />
              </Button>
            </Link>
          }
        />

        {shown.map((provider) => {
          const account = accounts.find((item) => item.provider === provider);
          const meta = AUTH_PROVIDER_META[provider];
          const isBusy = pendingProvider === provider;
          const isLast = methodsCount <= 1;

          return (
            <MethodRow
              key={provider}
              icon={meta.icon}
              title={meta.name}
              active={Boolean(account)}
              details={
                account ? (
                  <>
                    {account.name && <span className="text-white/80">{account.name} · </span>}
                    <Localize translationKey="pages:profile:accounts:linkedAt" />{' '}
                    {dayjs(account.linkedAt).format('DD.MM.YYYY')}
                  </>
                ) : (
                  <Localize translationKey="pages:profile:accounts:notLinked" />
                )
              }
              action={
                account ? (
                  <Modal
                    title={<Localize translationKey="pages:profile:accounts:unlinkTitle" />}
                    description={t('pages:profile:accounts:unlinkDescription', {
                      provider: meta.name,
                    })}
                    onConfirm={() => onUnlink(provider)}
                    onCancel
                    confirmVariant="destructive"
                    trigger={
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isBusy || isLast}
                        aria-busy={isBusy}
                        title={isLast ? t('pages:profile:accounts:lastMethod') : undefined}
                      >
                        <Localize
                          translationKey={
                            isBusy ? 'common:loading' : 'pages:profile:accounts:unlink'
                          }
                        />
                      </Button>
                    }
                  />
                ) : (
                  <Button
                    type="button"
                    variant="orange"
                    disabled={Boolean(pendingProvider)}
                    aria-busy={isBusy}
                    onClick={() => onLink(provider)}
                  >
                    <Localize
                      translationKey={isBusy ? 'common:loading' : 'pages:profile:accounts:link'}
                    />
                  </Button>
                )
              }
            />
          );
        })}
      </ul>

      {methodsCount <= 1 && accounts.length > 0 && (
        <p className="text-xs text-white/50">
          <Localize translationKey="pages:profile:accounts:lastMethod" />
        </p>
      )}
    </div>
  );
});

export { ProfileAccounts };
