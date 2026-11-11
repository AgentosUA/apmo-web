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
import { ContentPage } from '@/widgets/content-page';

import { changePasswordFormSchema } from './schema';

const ChangePassword = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const router = useRouter();

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

      toasterEntity.call({
        title: 'pages:profile:changePassword',
        description: 'pages:profile:changePasswordSuccess',
      });

      router.push('/profile');
    } catch (error) {
      setServerError(form, error);
    }
  });

  return (
    <ContentPage
      width="sm"
      title={<Localize translationKey="pages:profile:changePassword" />}
      back={{ href: '/profile', label: <Localize translationKey="common:back" /> }}
    >
      <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
          {/* Lets password managers attach the new password to the right account. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={userEntity.user?.username ?? ''}
            readOnly
            hidden
          />

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
    </ContentPage>
  );
});

export default ChangePassword;
