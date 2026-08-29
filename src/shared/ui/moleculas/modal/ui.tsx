import * as Dialog from '@radix-ui/react-dialog';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

import { Button } from '../../atoms/button';
import { Localize } from '../../quarks/localize/ui';

const Modal: FC<
  PropsWithChildren<{
    title?: ReactNode;
    description?: ReactNode;
    onConfirm?: () => void;
    onCancel?: (() => void) | boolean;
    trigger: React.ReactNode;
  }>
> = ({ title, description, trigger, children, onCancel, onConfirm }) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1000]" />
      <Dialog.Content className="fixed top-[40%] left-1/2 w-[90vw] max-w-[450px] max-h-[85vh] z-[1001] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
        {Boolean(title) && (
          <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
            {title}
          </Dialog.Title>
        )}
        {Boolean(description) && (
          <Dialog.Description className="p-[25px] text-white text-[15px] leading-normal">
            {description}
          </Dialog.Description>
        )}

        {children}

        <div className="absolute bottom-[-22px] left-0 flex justify-start gap-2.5 w-[90vw] max-w-[450px]">
          {Boolean(onCancel) && (
            <Dialog.Close asChild>
              <Button
                className="mr-auto"
                onClick={() =>
                  typeof onCancel === 'boolean' ? null : onCancel?.()
                }
              >
                <Localize translationKey="common:cancel" />
              </Button>
            </Dialog.Close>
          )}
          {Boolean(onConfirm) && (
            <Dialog.Close asChild>
              <Button className="ml-auto" onClick={onConfirm}>
                <Localize translationKey="common:confirm" />
              </Button>
            </Dialog.Close>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export { Modal };
