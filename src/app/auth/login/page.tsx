'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';

import { userEntity } from '@/entities/user/model';
import { useAuthorizated } from '@/entities/user/ui/authorization/hook';
import { setServerError, useZodForm } from '@/shared/lib/validation';
import { signInRequestSchema } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { Paper } from '@/shared/ui/atoms/paper';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage } from '@/widgets/content-page';

const LoginPage = observer(() => {
  const form = useZodForm(signInRequestSchema, {
    defaultValues: { email: '', password: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await userEntity.login(values);
    } catch (error) {
      setServerError(form, error);
    }
  });

  useAuthorizated(userEntity);

  return (
    <ContentPage width="sm" title={<Localize translationKey="widgets:header:logIn" />}>
      <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
          <FormAlert message={errors.root?.server?.message} />

          <Input
            label={<Localize translationKey="pages:auth:emailOrUsername" />}
            autoComplete="username"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              label={<Localize translationKey="pages:auth:password" />}
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Link
              className="ml-auto text-xs text-white/60 w-fit hover:underline hover:text-a3-orange"
              href="/auth/forgot-password"
            >
              <Localize translationKey="pages:auth:forgotPassword" />
            </Link>
          </div>

          <Button variant="bold" type="submit" className="w-full mt-1" aria-busy={isSubmitting}>
            <Localize translationKey={isSubmitting ? 'common:loading' : 'pages:auth:login'} />
          </Button>

          <p className="text-center text-xs text-white/50">
            <Localize translationKey="pages:auth:noAccount" />{' '}
            <Link href="/auth/sign-up" className="text-white hover:text-a3-orange hover:underline">
              <Localize translationKey="pages:auth:signUp" />
            </Link>
          </p>
        </fieldset>
      </Paper>
    </ContentPage>
  );
});

export default LoginPage;
