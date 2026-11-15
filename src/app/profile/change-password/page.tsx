'use client';

import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { userEntity } from '@/entities/user/model';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { setServerError, useZodForm } from '@/shared/lib/validation';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { Paper } from '@/shared/ui/atoms/paper';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { ContentPage } from '@/widgets/content-page';

import { changePasswordFormSchema, setPasswordFormSchema } from './schema';

/** Lets password managers attach the new password to the right account. */
const UsernameHint = observer(() => (
  <input
    type="text"
    name="username"
    autoComplete="username"
    value={userEntity.user?.username ?? ''}
    readOnly
    hidden
  />
));

const useOnSuccess = () => {
  const router = useRouter();

  return () => {
    toasterEntity.call({
      title: 'pages:profile:changePassword',
      description: 'pages:profile:changePasswordSuccess',
    });

    router.push('/profile');
  };
};

const ChangePasswordForm = () => {
  const onSuccess = useOnSuccess();

  const form = useZodForm(changePasswordFormSchema, {
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...values }) => {
    try {
      await userEntity.changePassword(values);
      onSuccess();
    } catch (error) {
      setServerError(form, error);
    }
  });

  return (
    <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
        <UsernameHint />

        <FormAlert message={errors.root?.server?.message} />

        <Input
          type="password"
          label={<Localize translationKey="pages:profile:oldPassword" />}
          autoComplete="current-password"
          autoFocus
          required
          error={errors.oldPassword?.message}
          {...register('oldPassword')}
        />

        <div className="h-px bg-white/10" aria-hidden />

        <Input
          type="password"
          label={<Localize translationKey="pages:profile:newPassword" />}
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
          {...register('newPassword', {
            onChange: () =>
              form.formState.touchedFields.confirmPassword && form.trigger('confirmPassword'),
          })}
        />
        <Input
          type="password"
          label={<Localize translationKey="pages:profile:confirmPassword" />}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button className="w-full mt-1" variant="bold" type="submit" aria-busy={isSubmitting}>
          <Localize
            translationKey={isSubmitting ? 'common:loading' : 'pages:profile:changePassword'}
          />
        </Button>
      </fieldset>
    </Paper>
  );
};

/** For users who signed up with Google / Steam / VTG and have no password yet. */
const SetPasswordForm = () => {
  const onSuccess = useOnSuccess();

  const form = useZodForm(setPasswordFormSchema, {
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ confirmPassword: _, ...values }) => {
    try {
      await userEntity.setPassword(values);
      onSuccess();
    } catch (error) {
      setServerError(form, error);
    }
  });

  return (
    <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
        <UsernameHint />

        <FormAlert message={errors.root?.server?.message} />

        <p className="text-sm text-white/70 leading-relaxed">
          <Localize translationKey="pages:profile:setPasswordHint" />
        </p>

        <Input
          type="password"
          label={<Localize translationKey="pages:profile:newPassword" />}
          autoComplete="new-password"
          autoFocus
          required
          error={errors.newPassword?.message}
          {...register('newPassword', {
            onChange: () =>
              form.formState.touchedFields.confirmPassword && form.trigger('confirmPassword'),
          })}
        />
        <Input
          type="password"
          label={<Localize translationKey="pages:profile:confirmPassword" />}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button className="w-full mt-1" variant="bold" type="submit" aria-busy={isSubmitting}>
          <Localize
            translationKey={isSubmitting ? 'common:loading' : 'pages:profile:setPassword'}
          />
        </Button>
      </fieldset>
    </Paper>
  );
};

const ChangePassword = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const { user } = userEntity;
  const hasPassword = user?.hasPassword !== false;

  return (
    <ContentPage
      width="sm"
      title={
        <Localize
          translationKey={
            hasPassword ? 'pages:profile:changePassword' : 'pages:profile:setPassword'
          }
        />
      }
      back={{ href: '/profile', label: <Localize translationKey="common:back" /> }}
    >
      {!user ? (
        <Paper padding="lg" aria-busy>
          <Preloader isLoading />
        </Paper>
      ) : hasPassword ? (
        <ChangePasswordForm />
      ) : (
        <SetPasswordForm />
      )}
    </ContentPage>
  );
});

export default ChangePassword;
