'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { planEntity } from '@/entities/plan';
import { useZodForm } from '@/shared/lib/validation';
import { PLAN_TITLE_MAX, savePlanFormSchema } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Localize } from '@/shared/ui/quarks/localize/ui';

const SavePlanForm = observer(({ onDone }: { onDone: () => void }) => {
  const router = useRouter();

  const form = useZodForm(savePlanFormSchema, {
    defaultValues: { title: planEntity.defaultTitle },
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = form.handleSubmit(async ({ title }) => {
    const id = await planEntity.createPlan(title);

    if (!id) return;

    onDone();
    router.push(`/plans/${id}`);
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 p-[25px]">
      <p className="text-sm text-white/70">
        <Localize translationKey="widgets:planToolbar:saveDescription" />
      </p>
      <Input
        {...register('title')}
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        maxLength={PLAN_TITLE_MAX}
        label={<Localize translationKey="widgets:planToolbar:planName" />}
        error={errors.title?.message}
        disabled={isSubmitting}
        required
      />
      <div className="flex justify-between gap-2.5">
        <Dialog.Close asChild>
          <Button type="button" variant="transparent">
            <Localize translationKey="common:cancel" />
          </Button>
        </Dialog.Close>
        <Button type="submit" variant="orange" disabled={isSubmitting} aria-busy={isSubmitting}>
          <Localize translationKey={isSubmitting ? 'common:loading' : 'widgets:planToolbar:save'} />
        </Button>
      </div>
    </form>
  );
});

/**
 * "Save" for a plan that does not exist on the server yet: asks for a name
 * (the mission name by default), creates the plan and opens it. From then on
 * every change is saved automatically.
 */
const SavePlanDialog = ({ trigger }: { trigger: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1100]" />
        <Dialog.Content className="fixed top-[40%] left-1/2 w-[90vw] max-w-[450px] z-[1101] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
          <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
            <Localize translationKey="widgets:planToolbar:saveTitle" />
          </Dialog.Title>
          {isOpen && <SavePlanForm onDone={() => setIsOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { SavePlanDialog };
