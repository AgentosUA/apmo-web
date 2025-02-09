import * as Dialog from '@radix-ui/react-dialog';
import { FC, PropsWithChildren } from 'react';

import { Button } from '../../atoms/button';

import styles from './ui.module.scss';

const Modal: FC<
  PropsWithChildren<{
    title?: string;
    description?: string;
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
                Cancel
              </Button>
            </Dialog.Close>
          )}
          {Boolean(onConfirm) && (
            <Dialog.Close asChild>
              <Button className={styles.confirm} onClick={onConfirm}>
                Confirm
              </Button>
            </Dialog.Close>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export { Modal };
