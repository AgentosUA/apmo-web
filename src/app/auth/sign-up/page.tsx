'use client';

import * as yup from 'yup';

import { Form, SubmitHandler, useForm } from 'react-hook-form';

import { Header } from '@/widgets/header/ui';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './ui.module.scss';
import { useYupValidationResolver } from '@/shared/lib/yup/use-yup-validation-resolver';

type FormFields = {
  email: string;
  username: string;
  password: string;
  rePassword: string;
};

const SignUpPage = () => {
  const validationSchema = yup.object({
    email: yup.string().required('Required'),
    username: yup.string().required('Required'),
    password: yup.string().required('Required'),
    rePassword: yup.string().required('Required'),
  });

  const { register, handleSubmit, control } = useForm<FormFields>({
    resolver: useYupValidationResolver(validationSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      rePassword: '',
    },
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log(data);
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <Form
          control={control}
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}>
          <h2>Sign up</h2>
          <Input {...register('email')} type='Email' placeholder='Email' />
          <Input {...register('username')} type='text' placeholder='Username' />
          <Input
            {...register('password')}
            type='password'
            placeholder='Password'
          />
          <Input
            {...register('rePassword')}
            type='re-password'
            placeholder='Re-password'
          />
          <Button variant='bold' type='submit'>
            Sign Up
          </Button>
        </Form>
      </main>
      <Footer />
    </div>
  );
};

export default SignUpPage;
