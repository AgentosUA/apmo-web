'use client';

import { observer } from 'mobx-react-lite';

import { Header } from '@/widgets/header';

import { Footer } from '@/widgets/footer';

import * as yup from 'yup';

import styles from './page.module.scss';
import Image from 'next/image';
import { userEntity } from '@/entities/user/model';
import { useEffect } from 'react';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { mapList } from '@/shared/data/map-list';
import { Button } from '@/shared/ui/atoms/button';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { useRouter } from 'next/navigation';
import { apmoApi, Plan } from '@/shared/sdk';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { Input } from '@/shared/ui/atoms/input/ui';
import { useFormik } from 'formik';
import { Preloader } from '@/shared/ui/quarks/preloader';

const ChangePassword = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const router = useRouter();

  const validationSchema = yup.object({
    oldPassword: yup.string().required('Required'),
    newPassword: yup.string().required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validationSchema,
    onSubmit: () => {
      userEntity.changePassword(
        formik.values,
        () => router.push('/profile'),
        (error) => {
          formik.setErrors({ newPassword: error });
        }
      );
    },
  });

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <Preloader isLoading={userEntity.isLoadingChangePassword}>
            <h2 className={styles.title}>Change password</h2>
            <Input
              id='oldPassword'
              type='password'
              label='Old password'
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.oldPassword ? formik.errors.oldPassword : ''
              }
            />
            <Input
              id='newPassword'
              type='password'
              label='New password'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.newPassword}
              error={
                formik.touched.newPassword ? formik.errors.newPassword : ''
              }
            />

            <Button className={styles.submit} variant='bold' type='submit'>
              Change password
            </Button>
          </Preloader>
        </form>
      </main>
      <Footer />
    </div>
  );
});

export default ChangePassword;
