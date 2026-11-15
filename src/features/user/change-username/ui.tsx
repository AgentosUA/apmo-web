'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsPencil } from 'react-icons/bs';

import { userEntity } from '@/entities/user/model';
import { setServerError, USERNAME_MAX, useZodForm } from '@/shared/lib/validation';
import {
  changeUsernameRequestSchema,
  getApiErrorMessage,
  USERNAME_TAKEN_ERROR,
} from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';

const UsernameForm = ({ onDone }: { onDone: () => void }) => {
  const form = useZodForm(changeUsernameRequestSchema, {
    defaultValues: { username: userEntity.user?.username ?? '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    // Nothing to save, e.g. only spaces were added around the nickname.
    if (values.username === userEntity.user?.username) {
      onDone();
      return;
    }

    try {
      await userEntity.changeUsername(values);

      toasterEntity.call({
        title: 'pages:profile:username:changedTitle',
        description: values.username,
      });

      onDone();
    } catch (error) {
      if (getApiErrorMessage(error) === USERNAME_TAKEN_ERROR) {
        form.setError(
          'username',
          { type: 'server', message: 'pages:profile:username:taken' },
          { shouldFocus: true }
        );
        return;
      }

      setServerError(form, error);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-[25px]">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-4 min-w-0">
        <FormAlert message={errors.root?.server?.message} />

        <Input
          label={<Localize translationKey="pages:auth:username" />}
          hint={<Localize translationKey="pages:profile:username:hint" />}
          autoComplete="username"
          autoFocus
          required
          maxLength={USERNAME_MAX + 8}
          error={errors.username?.message}
          {...register('username')}
        />

        <div className="flex justify-between gap-2.5">
          <Dialog.Close asChild>
            <Button type="button">
              <Localize translationKey="common:cancel" />
            </Button>
          </Dialog.Close>
          <Button
            type="submit"
            variant="orange"
            disabled={!isDirty || isSubmitting}
            aria-busy={isSubmitting}
          >
            <Localize translationKey={isSubmitting ? 'common:loading' : 'common:save'} />
          </Button>
        </div>
      </fieldset>
    </form>
  );
};

/** Pencil button next to the nickname that opens the "change nickname" dialog. */
const ChangeUsername = observer(({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = t('pages:profile:username:change');

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          title={label}
          aria-label={label}
          className={
            className ??
            'inline-flex h-7 w-7 shrink-0 items-center justify-center text-white/60 border border-solid border-white/15 hover:text-white hover:border-a3-orange focus-visible:outline-none focus-visible:border-a3-orange transition-colors'
          }
        >
          <BsPencil aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1100]" />
        <Dialog.Content className="fixed top-[40%] left-1/2 w-[90vw] max-w-[450px] z-[1101] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
          <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
            {label}
          </Dialog.Title>
          <Dialog.Description className="sr-only">{label}</Dialog.Description>
          {/* Mounted only while open, so the field starts from the current nickname. */}
          {open && <UsernameForm onDone={() => setOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export { ChangeUsername };
