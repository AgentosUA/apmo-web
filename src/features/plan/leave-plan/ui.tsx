'use client';

import { useEffect, useState } from 'react';

import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';

import { getLeavePlanWarning } from './model';

/**
 * Asks before leaving a plan with work that would be lost (see `getLeavePlanWarning`).
 * Use in an `observer` component: `requestLeave()` instead of leaving directly,
 * and render `modal`. Reloading / closing the tab gets the browser's own prompt.
 */
const useLeavePlanGuard = (onLeave: () => void) => {
  const [isOpen, setIsOpen] = useState(false);

  const warning = getLeavePlanWarning();

  useEffect(() => {
    if (!warning) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [warning]);

  const requestLeave = () => {
    if (getLeavePlanWarning()) {
      setIsOpen(true);

      return;
    }

    onLeave();
  };

  const modal = (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title={<Localize translationKey="widgets:mapOverlay:leavePlanTitle" />}
      description={
        <Localize
          translationKey={
            warning === 'unsynced'
              ? 'widgets:mapOverlay:leavePlanUnsyncedDescription'
              : 'widgets:mapOverlay:leavePlanUnsavedDescription'
          }
        />
      }
      onCancel
      onConfirm={onLeave}
      confirmVariant="destructive"
      confirmLabel={<Localize translationKey="widgets:mapOverlay:leavePlanConfirm" />}
    />
  );

  return { requestLeave, modal };
};

export { useLeavePlanGuard };
