'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { userEntity } from '@/entities/user/model';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';

/**
 * Wraps a logout trigger with a confirmation dialog. On confirm the session
 * is cleared and the user is sent to the home page.
 */
const LogoutConfirm = ({
  trigger,
  onLoggedOut,
}: {
  /** Must be a single element that accepts a ref and `onClick` (button). */
  trigger: ReactNode;
  onLoggedOut?: () => void;
}) => {
  const router = useRouter();

  const onConfirm = () => {
    userEntity.logout();
    onLoggedOut?.();
    router.push('/');
  };

  return (
    <Modal
      title={<Localize translationKey="features:logout:title" />}
      description={<Localize translationKey="features:logout:description" />}
      confirmLabel={<Localize translationKey="features:logout:confirm" />}
      confirmVariant="destructive"
      onCancel
      onConfirm={onConfirm}
      trigger={trigger}
    />
  );
};

export { LogoutConfirm };
