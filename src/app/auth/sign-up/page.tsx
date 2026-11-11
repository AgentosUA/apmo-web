'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { userEntity } from '@/entities/user/model';
import { useAuthorizated } from '@/entities/user/ui/authorization/hook';
import { setServerError, useZodForm } from '@/shared/lib/validation';
import { api } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { Paper } from '@/shared/ui/atoms/paper';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage } from '@/widgets/content-page';

import { signUpFormSchema } from './schema';

const SignUpPage = observer(() => {
  const router = useRouter();

  const form = useZodForm(signUpFormSchema, {
    defaultValues: { email: '', username: '', password: '', rePassword: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ rePassword: _, ...values }) => {
    try {
      await api.auth.signUp(values);

      toasterEntity.call({
        title: 'pages:auth:accountCreatedTitle',
        description: 'pages:auth:accountCreatedDescription',
      });

      router.push('/auth/login');
    } catch (error) {
      setServerError(form, error);
    }
  });

  useAuthorizated(userEntity);

  return (
    <ContentPage width="sm" title={<Localize translationKey="pages:auth:signUp" />}>
      <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
          <FormAlert message={errors.root?.server?.message} />

          <Input
            type="email"
            label={<Localize translationKey="pages:auth:email" />}
            autoComplete="email"
            autoFocus
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={<Localize translationKey="pages:auth:username" />}
            autoComplete="username"
            required
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            type="password"
            label={<Localize translationKey="pages:auth:password" />}
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register('password', {
              // Keep the confirmation error in sync when the password changes.
              onChange: () => form.formState.touchedFields.rePassword && form.trigger('rePassword'),
            })}
          />
          <Input
            type="password"
            label={<Localize translationKey="pages:auth:rePassword" />}
            autoComplete="new-password"
            required
            error={errors.rePassword?.message}
            {...register('rePassword')}
          />

          <Button variant="bold" type="submit" className="w-full mt-1" aria-busy={isSubmitting}>
            <Localize translationKey={isSubmitting ? 'common:loading' : 'pages:auth:signUp'} />
          </Button>

          <p className="text-center text-xs text-white/50">
            <Localize translationKey="pages:auth:haveAccount" />{' '}
            <Link href="/auth/login" className="text-white hover:text-a3-orange hover:underline">
              <Localize translationKey="pages:auth:login" />
            </Link>
          </p>
        </fieldset>
      </Paper>
    </ContentPage>
  );
});

export default SignUpPage;
