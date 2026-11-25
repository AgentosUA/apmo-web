'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { userEntity } from '@/entities/user/model';
import { AUTH_PROVIDER_META } from '@/features/user/social-login';
import {
  AUTH_PROVIDERS,
  OAUTH_ERROR_CODES,
  type AuthProvider,
  type OAuthErrorCode,
} from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Paper } from '@/shared/ui/atoms/paper';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { ContentPage } from '@/widgets/content-page';

type CallbackError = { code: OAuthErrorCode; provider: AuthProvider | null };

const readProvider = (value: string | null) =>
  AUTH_PROVIDERS.includes(value as AuthProvider) ? (value as AuthProvider) : null;

/**
 * The API sends the browser here after Google / Steam / VTG with the result
 * in the URL fragment: `#signedIn=1[&new=1]` (the session cookies are already
 * set on that redirect), `#linked=<provider>` or `#error=<code>`.
 */
const OAuthCallbackPage = observer(() => {
  const router = useRouter();
  const handled = useRef(false);
  const [error, setError] = useState<CallbackError | null>(null);

  useEffect(() => {
    // Strict mode runs effects twice; the fragment is already gone the second time.
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));

    // Keep the address bar clean (and out of the history).
    window.history.replaceState(window.history.state, '', window.location.pathname);

    const signedIn = params.get('signedIn') === '1';
    const linked = readProvider(params.get('linked'));
    const errorCode = params.get('error');

    if (signedIn) {
      const isNew = params.get('new') === '1';

      void userEntity.completeExternalLogin().then((ok) => {
        if (!ok) {
          setError({ code: 'provider_error', provider: readProvider(params.get('provider')) });
          return;
        }

        if (isNew) {
          toasterEntity.call({
            title: 'pages:auth:oauth:welcomeTitle',
            description: 'pages:auth:oauth:welcomeDescription',
          });
        }

        router.replace('/profile');
      });

      return;
    }

    if (linked) {
      toasterEntity.call({
        title: 'pages:auth:oauth:linkedTitle',
        description: AUTH_PROVIDER_META[linked].name,
      });

      router.replace('/profile?tab=accounts');
      return;
    }

    if (errorCode) {
      setError({
        code: OAUTH_ERROR_CODES.includes(errorCode as OAuthErrorCode)
          ? (errorCode as OAuthErrorCode)
          : 'provider_error',
        provider: readProvider(params.get('provider')),
      });
      return;
    }

    router.replace('/auth/login');
  }, [router]);

  if (!error) {
    return (
      <ContentPage width="sm" title={<Localize translationKey="pages:auth:login" />}>
        <Paper padding="lg" aria-busy>
          <Preloader isLoading />
        </Paper>
      </ContentPage>
    );
  }

  // Linking from the profile goes back there; signing in goes back to the login page.
  const backHref = userEntity.isAuthorized ? '/profile?tab=accounts' : '/auth/login';
  const providerName = error.provider ? AUTH_PROVIDER_META[error.provider].name : '';

  return (
    <ContentPage
      width="sm"
      title={<Localize translationKey="pages:auth:oauth:errorTitle" />}
      subtitle={providerName || undefined}
    >
      <Paper padding="lg" className="flex flex-col gap-5">
        <FormAlert message={`pages:auth:oauth:errors:${error.code}`} />

        {error.code === 'email_in_use' && (
          <p className="text-sm text-white/70 leading-relaxed">
            <Localize translationKey="pages:auth:oauth:emailInUseHint" />
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Link href={backHref} className="w-full">
            <Button variant="bold" className="w-full">
              <Localize
                translationKey={
                  userEntity.isAuthorized ? 'pages:auth:oauth:backToProfile' : 'pages:auth:login'
                }
              />
            </Button>
          </Link>
          {error.code === 'email_in_use' && (
            <Link
              href="/auth/forgot-password"
              className="text-center text-xs text-white/60 hover:underline hover:text-a3-orange"
            >
              <Localize translationKey="pages:auth:forgotPassword" />
            </Link>
          )}
        </div>
      </Paper>
    </ContentPage>
  );
});

export default OAuthCallbackPage;
