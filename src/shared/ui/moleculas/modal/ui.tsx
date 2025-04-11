import * as Dialog from '@radix-ui/react-dialog';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { Button } from '../../atoms/button';

import styles from './ui.module.scss';
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
      <Dialog.Overlay className={styles.dialogOverlay} />
      <Dialog.Content className={styles.dialogContent}>
        {Boolean(title) && (
          <Dialog.Title className={styles.dialogTitle}>{title}</Dialog.Title>
        )}
        {Boolean(description) && (
          <Dialog.Description className={styles.dialogDescription}>
            {description}
          </Dialog.Description>
        )}

        {children}

        <div className={styles.buttons}>
          {Boolean(onCancel) && (
            <Dialog.Close asChild>
              <Button
                className={styles.cancel}
                onClick={() =>
                  typeof onCancel === 'boolean' ? null : onCancel?.()
                }>
                <Localize translationKey='common:cancel' />
              </Button>
            </Dialog.Close>
          )}
          {Boolean(onConfirm) && (
            <Dialog.Close asChild>
              <Button className={styles.confirm} onClick={onConfirm}>
                <Localize translationKey='common:confirm' />
              </Button>
            </Dialog.Close>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export { Modal };
