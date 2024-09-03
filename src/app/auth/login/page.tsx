'use client';

import * as yup from 'yup';

import { useFormik } from 'formik';

import { Header } from '@/widgets/header/ui';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './ui.module.scss';

import { userEntity } from '@/entities/user/model';

import { observer } from 'mobx-react-lite';

import { useAuthorizated } from '@/entities/user/ui/authorization/hook';
import Link from 'next/link';

const LoginPage = observer(() => {
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
    onSubmit: () => {
      userEntity.login(formik.values, (error) =>
        formik.setErrors({ password: error })
      );
    },
  });

  useAuthorizated(userEntity);

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <h2>Log in</h2>
          <Input
            id='email'
            label='Email or username'
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

          <Link className={styles.forgotPassword} href='/auth/forgot-password'>
            Forgot password?
          </Link>
          <Button variant='bold' type='submit'>
            Log in
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
});

export default LoginPage;
