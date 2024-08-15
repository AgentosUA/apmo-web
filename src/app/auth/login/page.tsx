'use client';

import * as yup from 'yup';

import { useFormik } from 'formik';

import { Header } from '@/widgets/header/ui';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './ui.module.scss';
import { apmoApi } from '@/shared/sdk';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { useRouter } from 'next/navigation';
import { userEntity } from '@/entities/user/model';

const LoginPage = () => {
  const router = useRouter();

  const validationSchema = yup.object({
    email: yup.string().required('Required'),
    password: yup.string().required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validationSchema,
    onSubmit: userEntity.login,
  });

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <h2>Log in</h2>
          <Input
            id='email'
            type='Email'
            label='Email'
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : ''}
          />
          <Input
            id='password'
            type='password'
            label='Password'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : ''}
          />

          <Button variant='bold' type='submit'>
            Log in
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
