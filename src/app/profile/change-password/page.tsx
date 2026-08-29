'use client';

import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as yup from 'yup';

import { userEntity } from '@/entities/user/model';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

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
    <div className="flex flex-col h-full min-h-screen min-h-svh">
      <Header />
      <main className="flex gap-[25px] flex-nowrap tablet:flex-wrap tablet:flex-col tablet:items-center my-[45px] mx-auto p-[15px] w-full max-w-[650px] text-white bg-a3-surface">
        <form
          className="flex flex-col gap-5 w-full max-w-[300px] mx-auto"
          onSubmit={formik.handleSubmit}
        >
          <Preloader isLoading={userEntity.isLoadingChangePassword}>
            <h2 className="mb-2.5">
              <Localize translationKey="pages:profile:changePassword" />
            </h2>
            <Input
              id="oldPassword"
              type="password"
              label={<Localize translationKey="pages:profile:oldPassword" />}
              value={formik.values.oldPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.oldPassword ? formik.errors.oldPassword : ''
              }
            />
            <Input
              id="newPassword"
              type="password"
              label={<Localize translationKey="pages:profile:newPassword" />}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.newPassword}
              error={
                formik.touched.newPassword ? formik.errors.newPassword : ''
              }
            />

            <Button className="mt-[15px]" variant="bold" type="submit">
              <Localize translationKey="pages:profile:changePassword" />
            </Button>
          </Preloader>
        </form>
      </main>
      <Footer />
    </div>
  );
});

export default ChangePassword;
