'use client';

import { Form, SubmitHandler, useForm } from 'react-hook-form';

import { Header } from '@/widgets/header/ui';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';

import styles from './ui.module.scss';

type FormFields = {
  email: string;
  password: string;
};

const SignUpPage = () => {
  const { register, handleSubmit, control } = useForm<FormFields>({
    defaultValues: {
      email: '',
      password: '',
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
          <h2>Log in</h2>

          <Input
            {...register('email')}
            type='text'
            placeholder='Email or Username'
          />

          <Input
            {...register('password')}
            type='password'
            placeholder='Password'
          />

          <Button variant='bold' type='submit'>
            Log in
          </Button>
        </Form>
      </main>
      <Footer />
    </div>
  );
};

export default SignUpPage;
