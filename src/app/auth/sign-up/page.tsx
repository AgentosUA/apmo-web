'use client';

import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { userEntity } from '@/entities/user/model';
import { useAuthorizated } from '@/entities/user/ui/authorization/hook';
import { apmoApi } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header/ui';

import styles from './ui.module.scss';

const SignUpPage = observer(() => {
  const { t } = useTranslation();
  const router = useRouter();

  const validationSchema = yup.object({
    email: yup.string().email(t('common:notValidEmail')).required(t('common:required')),
    username: yup.string().required(t('common:required')),
    password: yup.string().required(t('common:required')),
    rePassword: yup
      .string()
      .required(t('common:required'))
      .oneOf([yup.ref('password'), ''], t('common:passwordsMustMatch')),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
      rePassword: '',
    },
    onSubmit: async (values) => {
      try {
        await apmoApi.user.signUp(values);

        router.push('/auth/login');

        toasterEntity.call({
          title: 'Acount created',
          description: 'You can now login',
        });
      } catch (error: any) {
        formik.setErrors({
          rePassword: error?.response?.data?.message ?? 'Unknown error',
        });
      }
    },

    enableReinitialize: true,
    validateOnBlur: true,
    validationSchema,
  });

  useAuthorizated(userEntity);

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <h2>
            <Localize translationKey="pages:auth:signUp" />
          </h2>
          <Input
            id="email"
            type="Email"
            label={<Localize translationKey="pages:auth:email" />}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : ''}
          />
          <Input
            id="username"
            type="text"
            label={<Localize translationKey="pages:auth:username" />}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
            error={formik.touched.username ? formik.errors.username : ''}
          />
          <Input
            id="password"
            type="password"
            label={<Localize translationKey="pages:auth:password" />}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : ''}
          />
          <Input
            id="rePassword"
            type="password"
            label={<Localize translationKey="pages:auth:rePassword" />}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.rePassword}
            error={formik.touched.rePassword ? formik.errors.rePassword : ''}
          />
          <Button variant="bold" type="submit">
            <Localize translationKey="pages:auth:signUp" />
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
});

export default SignUpPage;
