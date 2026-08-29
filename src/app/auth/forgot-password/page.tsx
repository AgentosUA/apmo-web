'use client';

import { useFormik } from 'formik';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { apmoApi } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

const AUTH_WRAPPER = 'flex flex-col h-full min-h-screen min-h-svh';
const AUTH_FORM =
  'mt-[150px] mx-auto p-[15px] w-full max-w-[450px] flex flex-col gap-[25px] bg-a3-surface [&_h2]:text-white [&_h2]:text-xl [&_h2]:text-center';

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
    <div className={AUTH_WRAPPER}>
      <Header />
      <form className={AUTH_FORM} onSubmit={formik.handleSubmit}>
        <Preloader isLoading={isLoading}>
          <h2>
            <Localize translationKey="common:resetPassword" />
          </h2>
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
      </form>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
