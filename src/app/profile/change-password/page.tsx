'use client';

import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as yup from 'yup';

import { userEntity } from '@/entities/user/model';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { Button } from '@/shared/ui/atoms/button';
import { Paper } from '@/shared/ui/atoms/paper';
import { Input } from '@/shared/ui/atoms/input/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { ContentPage } from '@/widgets/content-page';

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
    <ContentPage
      width="sm"
      title={<Localize translationKey="pages:profile:changePassword" />}
      back={{ href: '/profile', label: <Localize translationKey="common:back" /> }}
    >
      <Paper as="form" padding="lg" className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
        <Preloader isLoading={userEntity.isLoadingChangePassword}>
          <Input
            id="oldPassword"
            type="password"
            label={<Localize translationKey="pages:profile:oldPassword" />}
            value={formik.values.oldPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.oldPassword ? formik.errors.oldPassword : ''}
          />
          <Input
            id="newPassword"
            type="password"
            label={<Localize translationKey="pages:profile:newPassword" />}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.newPassword}
            error={formik.touched.newPassword ? formik.errors.newPassword : ''}
          />

          <Button className="mt-2" variant="bold" type="submit">
            <Localize translationKey="pages:profile:changePassword" />
          </Button>
        </Preloader>
      </Paper>
    </ContentPage>
  );
});

export default ChangePassword;
