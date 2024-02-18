import React, { FC, PropsWithChildren } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { IoMdClose } from 'react-icons/io';

import styles from './ui.module.scss';
import { Button } from '../../atoms/button';

const Modal: FC<
  PropsWithChildren<{
    title?: string;
    description?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
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
          <Dialog.Close asChild>
            {Boolean(onCancel) && (
              <Button className={styles.cancel} onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Dialog.Close>
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
