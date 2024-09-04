'use client';

import * as yup from 'yup';

import { useFormik } from 'formik';

import { Button } from '@/shared/ui/atoms/button';

import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './page.module.scss';
import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/footer';
import { apmoApi } from '@/shared/sdk';
import { useState } from 'react';

import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object({
      email: yup.string().email('Invalid email').required('Required'),
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
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className={styles.wrapper}>
      <Header />
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <Preloader isLoading={isLoading}>
          <h2>Forgot password</h2>
          <Input
            id='email'
            type='email'
            label='Email'
            value={formik.values.email}
            error={formik.touched.email ? formik.errors.email : ''}
            onChange={formik.handleChange}
          />
          <Button variant='bold' type='submit'>
            Submit
          </Button>
        </Preloader>
      </form>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
