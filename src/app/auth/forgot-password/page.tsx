'use client';

import { useRouter } from 'next/navigation';

import { setServerError, useZodForm } from '@/shared/lib/validation';
import { api, forgotPasswordRequestSchema, getApiErrorMessage } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { Paper } from '@/shared/ui/atoms/paper';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { ContentPage } from '@/widgets/content-page';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();

  const form = useZodForm(forgotPasswordRequestSchema, {
    defaultValues: { email: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.auth.forgotPassword(values);

      toasterEntity.call({
        title: 'pages:auth:resetSentTitle',
        description: 'pages:auth:resetSentDescription',
      });

      router.push('/auth/login');
    } catch (error) {
      if (getApiErrorMessage(error) === 'Email is not found') {
        form.setError(
          'email',
          { type: 'server', message: 'errors:emailNotFound' },
          { shouldFocus: true }
        );

        return;
      }

      setServerError(form, error);
    }
  });

  return (
    <ContentPage
      width="sm"
      title={<Localize translationKey="common:resetPassword" />}
      back={{ href: '/auth/login', label: <Localize translationKey="common:back" /> }}
    >
      <Paper as="form" padding="lg" noValidate onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="flex flex-col gap-5 min-w-0">
          <FormAlert message={errors.root?.server?.message} />

          <Input
            type="email"
            label={<Localize translationKey="pages:auth:email" />}
            hint={<Localize translationKey="pages:auth:resetHint" />}
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />

          <Button variant="bold" type="submit" className="w-full mt-1" aria-busy={isSubmitting}>
            <Localize translationKey={isSubmitting ? 'common:loading' : 'common:continue'} />
          </Button>
        </fieldset>
      </Paper>
    </ContentPage>
  );
};

export default ForgotPasswordPage;
