'use client';

import { Form, SubmitHandler, useForm } from 'react-hook-form';

import { Header } from '@/widgets/header/ui';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './ui.module.scss';

type FormFields = {
  email: string;
  username: string;
  password: string;
  rePassword: string;
};

const SignUpPage = () => {
  const { register, handleSubmit, control } = useForm<FormFields>({
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
