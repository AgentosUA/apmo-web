'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { setServerError, useZodForm } from '@/shared/lib/validation';
import { PLAN_TITLE_MAX, savePlanFormSchema } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { FormAlert } from '@/shared/ui/atoms/form-alert';
import { Input } from '@/shared/ui/atoms/input';
import { Localize } from '@/shared/ui/quarks/localize/ui';

type RenamePlanProps = {
  title: string;
  /** Saves the new (trimmed, changed) title. A thrown error is shown in the form. */
  onRename: (title: string) => Promise<void> | void;
};

const RenamePlanForm = ({ title, onRename, onDone }: RenamePlanProps & { onDone: () => void }) => {
  const form = useZodForm(savePlanFormSchema, { defaultValues: { title } });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    // Nothing to save, e.g. only spaces were added around the name.
    if (values.title === title) {
      onDone();

      return;
    }

    try {
      await onRename(values.title);
      onDone();
    } catch (error) {
      setServerError(form, error);
    }
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-[25px]">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-4 min-w-0">
        <FormAlert message={errors.root?.server?.message} />

        <Input
          {...register('title')}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          maxLength={PLAN_TITLE_MAX}
          label={<Localize translationKey="widgets:planToolbar:planName" />}
          error={errors.title?.message}
          required
        />

        <div className="flex justify-between gap-2.5">
          <Dialog.Close asChild>
            <Button type="button">
              <Localize translationKey="common:cancel" />
            </Button>
          </Dialog.Close>
          <Button type="submit" variant="orange" aria-busy={isSubmitting}>
            <Localize translationKey={isSubmitting ? 'common:loading' : 'common:save'} />
          </Button>
        </div>
      </fieldset>
    </form>
  );
};

/** "Rename plan" dialog opened by `trigger` (the plan title, a pencil button…). */
const RenamePlanDialog = ({ trigger, ...props }: RenamePlanProps & { trigger: ReactNode }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const label = t('widgets:planToolbar:renameTitle');

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1100]" />
        <Dialog.Content className="fixed top-[40%] left-1/2 w-[90vw] max-w-[450px] z-[1101] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
          <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
            {label}
          </Dialog.Title>
          <Dialog.Description className="sr-only">{label}</Dialog.Description>
          {/* Mounted only while open, so the field starts from the current name. */}
          {isOpen && <RenamePlanForm {...props} onDone={() => setIsOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { RenamePlanDialog };
