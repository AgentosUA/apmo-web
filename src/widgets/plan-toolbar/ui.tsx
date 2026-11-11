'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef, type ComponentPropsWithoutRef, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCloudOff, FiEye, FiLock, FiSave, FiShare2 } from 'react-icons/fi';

import { planEntity, planSession } from '@/entities/plan';
import { PlanAccessDialog } from '@/features/plan/plan-access';
import { SavePlanDialog } from '@/features/plan/save-plan';
import { Avatar } from '@/shared/ui/atoms/avatar';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

const MAX_VISIBLE_PEOPLE = 5;

/** Compact button for the 30px map header. The label hides on small screens. */
const HeaderButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> & {
    icon: ComponentType<{ className?: string }>;
    variant?: 'orange' | 'ghost';
  }
>(({ icon: Icon, children, className, variant = 'ghost', ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'flex h-[22px] items-center gap-1.5 px-2 text-xs uppercase text-white transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-a3-orange',
      variant === 'orange' ? 'bg-a3-orange hover:bg-a3-orange/80' : 'bg-white/10 hover:bg-white/20',
      className
    )}
    {...props}
  >
    <Icon className="text-sm" />
    <span className="mobile:hidden">{children}</span>
  </button>
));

HeaderButton.displayName = 'HeaderButton';

/** Overlapping round avatars of everyone who has the plan open, with a name tooltip. */
const PlanPresence = observer(() => {
  const { t } = useTranslation();
  const people = planSession.people;

  if (!people.length) return null;

  const visible = people.slice(0, MAX_VISIBLE_PEOPLE);
  const hidden = people.slice(MAX_VISIBLE_PEOPLE);

  return (
    <ul
      className="flex items-center pl-2"
      aria-label={t('widgets:planToolbar:viewers', { count: people.length })}
    >
      {visible.map((person) => {
        const label = person.isSelf
          ? `${person.username} (${t('widgets:planToolbar:you')})`
          : person.username;

        return (
          <li
            key={person.userId ?? person.sessionId}
            tabIndex={0}
            aria-label={label}
            className="group relative -ml-2 rounded-full outline-none hover:z-10 focus-visible:z-10"
          >
            <Avatar
              name={person.username}
              src={person.avatar}
              size={22}
              className={cn(
                'ring-2 ring-[#1F1F1F]',
                person.isSelf && 'ring-a3-orange',
                person.isGuest && 'opacity-90'
              )}
            />
            <span
              role="tooltip"
              className={cn(
                'pointer-events-none absolute right-1/2 top-full mt-1.5 translate-x-1/2 whitespace-nowrap',
                'bg-black/90 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity',
                'group-hover:opacity-100 group-focus-visible:opacity-100'
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
      {hidden.length > 0 && (
        <li
          tabIndex={0}
          className="group relative -ml-2 rounded-full outline-none hover:z-10 focus-visible:z-10"
        >
          <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#333] px-1 text-[10px] text-white ring-2 ring-[#1F1F1F]">
            +{hidden.length}
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full mt-1.5 flex flex-col whitespace-nowrap bg-black/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {hidden.map((person) => (
              <span key={person.userId ?? person.sessionId}>{person.username}</span>
            ))}
          </span>
        </li>
      )}
    </ul>
  );
});

/** "Saving…" / "Saved" / "Offline" / "View only". */
const SyncStatus = observer(() => {
  const { status, inFlight } = planSession;

  if (!planEntity.canEdit) {
    return (
      <span className="flex items-center gap-1 text-xs text-white/60">
        <FiEye />
        <span className="mobile:hidden">
          <Localize translationKey="widgets:planToolbar:viewOnly" />
        </span>
      </span>
    );
  }

  if (status === 'offline') {
    return (
      <span className="flex items-center gap-1 text-xs text-a3-red" role="status">
        <FiCloudOff />
        <span className="mobile:hidden">
          <Localize translationKey="widgets:planToolbar:offline" />
        </span>
      </span>
    );
  }

  if (status !== 'online') return null;

  return (
    <span className="text-xs text-white/50 mobile:hidden" role="status">
      <Localize
        translationKey={inFlight > 0 ? 'widgets:planToolbar:saving' : 'widgets:planToolbar:saved'}
      />
    </span>
  );
});

/**
 * Right side of the map header: "Save" for a new plan, or (saved plan)
 * sync status, viewers, "Share" and — for the owner — "Access".
 */
const PlanToolbar = observer(() => {
  if (!planEntity.isSaved) {
    return (
      <SavePlanDialog
        trigger={
          <HeaderButton icon={FiSave} variant="orange">
            <Localize translationKey="widgets:planToolbar:save" />
          </HeaderButton>
        }
      />
    );
  }

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      toasterEntity.call({
        title: 'widgets:mapOverlay:planLinkCopiedTitle',
        description: 'widgets:mapOverlay:planLinkCopiedDescription',
      });
    } catch {
      // Clipboard is not available (insecure context) — nothing to do.
    }
  };

  return (
    <>
      <SyncStatus />
      <PlanPresence />
      <HeaderButton icon={FiShare2} onClick={onShare}>
        <Localize translationKey="widgets:mapOverlay:sharePlan" />
      </HeaderButton>
      {planEntity.isOwner && (
        <PlanAccessDialog
          trigger={
            <HeaderButton icon={FiLock}>
              <Localize translationKey="widgets:planToolbar:access" />
            </HeaderButton>
          }
        />
      )}
    </>
  );
});

export { PlanToolbar, PlanPresence };
