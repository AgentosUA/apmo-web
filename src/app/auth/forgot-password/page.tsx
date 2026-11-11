'use client';

import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { apmoApi } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Paper } from '@/shared/ui/atoms/paper';
import { Input } from '@/shared/ui/atoms/input/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { ContentPage } from '@/widgets/content-page';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object({
      email: yup.string().email(t('common:notValidEmail')).required(t('common:required')),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await apmoApi.user.forgotPassword(values);

        toasterEntity.call({
          title: 'New password sended to email',
          description: 'Check your email',
        });

        router.push('/auth/login');
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error?.response?.data?.message === 'Email is not found') {
            formik.setErrors({ email: t('errors:emailNotFound') ?? '' });

            return;
          }

          formik.setErrors({ email: '' });
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <ContentPage
      width="sm"
      title={<Localize translationKey="common:resetPassword" />}
      back={{ href: '/auth/login', label: <Localize translationKey="common:back" /> }}
    >
      <Paper as="form" padding="lg" className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
        <Preloader isLoading={isLoading}>
          <Input
            id="email"
            type="email"
            label="Email"
            value={formik.values.email}
            error={formik.touched.email ? formik.errors.email : ''}
            onChange={formik.handleChange}
          />
          <Button variant="bold" type="submit">
            <Localize translationKey="common:continue" />
          </Button>
        </Preloader>
      </Paper>
    </ContentPage>
  );
};

export default ForgotPasswordPage;
