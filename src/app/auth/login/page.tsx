'use client';

import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import * as yup from 'yup';

import { userEntity } from '@/entities/user/model';
import { useAuthorizated } from '@/entities/user/ui/authorization/hook';
import { Button } from '@/shared/ui/atoms/button';
import { Paper } from '@/shared/ui/atoms/paper';
import { Input } from '@/shared/ui/atoms/input/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { ContentPage } from '@/widgets/content-page';

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
      userEntity.login(formik.values, (error) => formik.setErrors({ password: error }));
    },
  });

  useAuthorizated(userEntity);

  return (
    <ContentPage width="sm" title={<Localize translationKey="widgets:header:logIn" />}>
      <Paper as="form" padding="lg" className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
        <Preloader isLoading={userEntity.isLoadingLogin}>
          <Input
            id="email"
            label={<Localize translationKey="pages:auth:emailOrUsername" />}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : ''}
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

          <Link
            className="ml-auto text-white text-sm text-right w-fit hover:underline hover:text-a3-orange"
            href="/auth/forgot-password"
          >
            <Localize translationKey="pages:auth:forgotPassword" />
          </Link>
          <Button variant="bold" type="submit">
            <Localize translationKey="pages:auth:login" />
          </Button>
        </Preloader>
      </Paper>
    </ContentPage>
  );
});

export default LoginPage;
