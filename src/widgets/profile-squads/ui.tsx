'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BsPencil, BsTrash, BsUpload, BsXLg } from 'react-icons/bs';
import { FiLogOut, FiPlus } from 'react-icons/fi';

import { squadsEntity } from '@/entities/squads';
import { userEntity } from '@/entities/user/model';
import { PrincipalSearch, SquadLogo } from '@/features/principal-search';
import { setServerError, useZodForm } from '@/shared/lib/validation';
import {
  getApiErrorMessage,
  SQUAD_DESCRIPTION_MAX,
  SQUAD_LOGO_MIME_TYPES,
  SQUAD_NAME_MAX,
  SQUAD_TAG_MAX,
  squadFormSchema,
  squadLogoFileSchema,
  type Squad,
  type SquadForm,
} from '@/shared/sdk';
import { Avatar } from '@/shared/ui/atoms/avatar';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Skeleton } from '@/shared/ui/atoms/skeleton';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

const toastError = (title: string, error: unknown) =>
  toasterEntity.call({ title, description: getApiErrorMessage(error) });

/* ------------------------------ dialog ------------------------------ */

const SquadDialog = ({
  title,
  trigger,
  open,
  onOpenChange,
  children,
}: {
  title: ReactNode;
  trigger?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1100]" />
      <Dialog.Content className="fixed top-1/2 left-1/2 w-[94vw] max-w-[560px] max-h-[90svh] overflow-y-auto z-[1101] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
        <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
          {title}
        </Dialog.Title>
        <Dialog.Description className="sr-only">{title}</Dialog.Description>
        {open && children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

/* ------------------------------- form ------------------------------- */

const SquadFields = ({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: SquadForm;
  submitLabel: ReactNode;
  onSubmit: (values: SquadForm) => Promise<void>;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation();

  const form = useZodForm(squadFormSchema, {
    defaultValues: initial ?? { name: '', tag: '', description: '' },
  });

  const {
    register,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      form.reset(values);
    } catch (error) {
      setServerError(form, error);
    }
  });

  const descriptionError = errors.description?.message;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-3 mobile:grid-cols-1">
        <Input
          {...register('name')}
          maxLength={SQUAD_NAME_MAX}
          label={<Localize translationKey="pages:profile:squads:name" />}
          error={errors.name?.message}
          disabled={isSubmitting}
          required
        />
        <Input
          {...register('tag')}
          maxLength={SQUAD_TAG_MAX}
          label={<Localize translationKey="pages:profile:squads:tag" />}
          error={errors.tag?.message}
          disabled={isSubmitting}
          required
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs uppercase tracking-[0.08em] text-white/70">
          <Localize translationKey="pages:profile:squads:description" />
        </span>
        <textarea
          {...register('description')}
          rows={4}
          maxLength={SQUAD_DESCRIPTION_MAX}
          disabled={isSubmitting}
          className={cn(
            'w-full resize-y border border-white/15 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30',
            'hover:border-white/30 focus:border-a3-orange focus:bg-black/80 focus:outline-none',
            descriptionError && 'border-a3-red'
          )}
        />
        {descriptionError && <span className="text-xs text-a3-red">{t(descriptionError)}</span>}
      </label>

      {errors.root?.server?.message && (
        <p role="alert" className="text-sm text-a3-red">
          {t(errors.root.server.message)}
        </p>
      )}

      <div className="flex justify-between gap-2.5">
        {onCancel ? (
          <Button type="button" variant="transparent" onClick={onCancel}>
            <Localize translationKey="common:cancel" />
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          variant="orange"
          disabled={isSubmitting || (Boolean(initial) && !isDirty)}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? <Localize translationKey="common:loading" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
};

/* ------------------------------- logo ------------------------------- */

const LogoControls = observer(({ squad }: { squad: Squad }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    const parsed = squadLogoFileSchema.safeParse(file);

    if (!parsed.success) {
      toasterEntity.call({
        title: 'pages:profile:squads:logo',
        description: parsed.error.issues[0]?.message ?? 'common:unknownError',
      });

      return;
    }

    try {
      setIsBusy(true);
      await squadsEntity.uploadLogo(squad.id, parsed.data);
    } catch (error) {
      toastError('pages:profile:squads:logo', error);
    } finally {
      setIsBusy(false);
    }
  };

  const onRemove = async () => {
    try {
      setIsBusy(true);
      await squadsEntity.removeLogo(squad.id);
    } catch (error) {
      toastError('pages:profile:squads:logo', error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <SquadLogo squad={squad} size={72} />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={SQUAD_LOGO_MIME_TYPES.join(',')}
          className="hidden"
          onChange={onFileChange}
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="orange"
          className="flex items-center gap-2"
          disabled={isBusy}
          aria-busy={isBusy}
          onClick={() => inputRef.current?.click()}
        >
          <BsUpload />
          <Localize
            translationKey={isBusy ? 'common:loading' : 'pages:profile:squads:uploadLogo'}
          />
        </Button>
        {squad.logo && (
          <Button
            type="button"
            variant="transparent"
            className="flex items-center gap-2"
            disabled={isBusy}
            onClick={onRemove}
          >
            <BsXLg />
            <Localize translationKey="pages:profile:squads:removeLogo" />
          </Button>
        )}
        <span className="text-xs text-white/50">{t('pages:profile:avatarFileHint')}</span>
      </div>
    </div>
  );
});

/* ------------------------------ members ----------------------------- */

const MembersEditor = observer(({ squad }: { squad: Squad }) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const onAdd = async (userId: string) => {
    try {
      setBusyId(userId);
      await squadsEntity.addMember(squad.id, userId);
    } catch (error) {
      toastError('pages:profile:squads:members', error);
    } finally {
      setBusyId(null);
    }
  };

  const onRemove = async (userId: string) => {
    try {
      setBusyId(userId);
      await squadsEntity.removeMember(squad.id, userId);
    } catch (error) {
      toastError('pages:profile:squads:members', error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs uppercase tracking-[0.08em] text-white/60">
        <Localize translationKey="pages:profile:squads:members" /> ({squad.members.length})
      </h3>

      <PrincipalSearch
        kinds={['user']}
        excludeKeys={squad.members.map((member) => `user:${member.id}`)}
        onSelect={(item) => item.kind === 'user' && onAdd(item.user.id)}
        disabled={Boolean(busyId)}
      />

      <ul className="flex flex-col divide-y divide-white/10 border border-white/10">
        {squad.members.map((member) => {
          const isOwner = member.id === squad.owner.id;

          return (
            <li key={member.id} className="flex items-center gap-2.5 px-3 py-2">
              <Avatar name={member.username} src={member.avatar} size={28} />
              <span className="min-w-0 truncate text-sm">{member.username}</span>
              {isOwner ? (
                <span className="ml-auto text-xs uppercase text-a3-orange">
                  <Localize translationKey="pages:profile:squads:owner" />
                </span>
              ) : (
                <button
                  type="button"
                  className="ml-auto flex items-center gap-1.5 text-xs uppercase text-white/60 hover:text-white disabled:opacity-50"
                  disabled={busyId === member.id}
                  onClick={() => onRemove(member.id)}
                >
                  <BsXLg className="text-[10px]" />
                  <Localize translationKey="pages:profile:squads:removeMember" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

/* ------------------------------ dialogs ----------------------------- */

const CreateSquadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (values: SquadForm) => {
    await squadsEntity.create(values);

    toasterEntity.call({
      title: 'pages:profile:squads:createdTitle',
      description: values.name,
    });

    setIsOpen(false);
  };

  return (
    <SquadDialog
      title={<Localize translationKey="pages:profile:squads:create" />}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="orange" className="flex items-center gap-2">
          <FiPlus />
          <Localize translationKey="pages:profile:squads:create" />
        </Button>
      }
    >
      <div className="p-[25px]">
        <SquadFields
          submitLabel={<Localize translationKey="pages:profile:squads:create" />}
          onSubmit={onSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </SquadDialog>
  );
};

/** Owner: edit info, logo and members, delete the squad. */
const ManageSquadDialog = observer(
  ({
    squadId,
    open,
    onOpenChange,
  }: {
    squadId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    const squad = squadsEntity.items.find((item) => item.id === squadId);

    if (!squad) return null;

    const onSubmit = async (values: SquadForm) => {
      await squadsEntity.update(squad.id, values);

      toasterEntity.call({
        title: 'pages:profile:squads:savedTitle',
        description: values.name,
      });
    };

    const onDelete = async () => {
      try {
        await squadsEntity.remove(squad.id);
        onOpenChange(false);
      } catch (error) {
        toastError('pages:profile:squads:delete', error);
      }
    };

    return (
      <SquadDialog
        title={
          <>
            [{squad.tag}] {squad.name}
          </>
        }
        open={open}
        onOpenChange={onOpenChange}
      >
        <div className="flex flex-col gap-6 p-[25px]">
          <LogoControls squad={squad} />

          <SquadFields
            initial={{ name: squad.name, tag: squad.tag, description: squad.description }}
            submitLabel={<Localize translationKey="pages:profile:squads:save" />}
            onSubmit={onSubmit}
          />

          <MembersEditor squad={squad} />

          <div className="border-t border-white/10 pt-4">
            <Modal
              title={<Localize translationKey="pages:profile:squads:deleteTitle" />}
              description={<Localize translationKey="pages:profile:squads:deleteDescription" />}
              confirmLabel={<Localize translationKey="pages:profile:squads:delete" />}
              confirmVariant="destructive"
              onCancel
              onConfirm={onDelete}
              trigger={
                <Button variant="destructive" className="flex items-center gap-2">
                  <BsTrash />
                  <Localize translationKey="pages:profile:squads:delete" />
                </Button>
              }
            />
          </div>
        </div>
      </SquadDialog>
    );
  }
);

/* ------------------------------- card ------------------------------- */

const MAX_MEMBER_AVATARS = 8;

const SquadCard = observer(({ squad, onManage }: { squad: Squad; onManage: () => void }) => {
  const userId = userEntity.user?.id;
  const isOwner = squad.owner.id === userId;

  const onLeave = async () => {
    if (!userId) return;

    try {
      await squadsEntity.leave(squad.id, userId);
    } catch (error) {
      toastError('pages:profile:squads:leave', error);
    }
  };

  const extra = squad.members.length - MAX_MEMBER_AVATARS;

  return (
    <article className="flex gap-4 border border-white/10 bg-white/[0.03] p-3 mobile:flex-col">
      <SquadLogo squad={squad} size={64} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="text-base font-medium">
            <span className="text-a3-orange">[{squad.tag}]</span> {squad.name}
          </h3>
          <span className="text-xs uppercase text-white/50">
            <Localize
              translationKey={
                isOwner ? 'pages:profile:squads:owner' : 'pages:profile:squads:member'
              }
            />
          </span>
        </div>

        {squad.description && (
          <p className="whitespace-pre-line break-words text-sm text-white/70">
            {squad.description}
          </p>
        )}

        <div className="flex items-center pl-1.5">
          {squad.members.slice(0, MAX_MEMBER_AVATARS).map((member) => (
            <span key={member.id} title={member.username} className="-ml-1.5">
              <Avatar
                name={member.username}
                src={member.avatar}
                size={24}
                className="ring-2 ring-black"
              />
            </span>
          ))}
          {extra > 0 && <span className="ml-1.5 text-xs text-white/50">+{extra}</span>}
        </div>

        <div className="mt-1 flex flex-wrap gap-2.5">
          {isOwner ? (
            <Button variant="orange" className="flex items-center gap-2" onClick={onManage}>
              <BsPencil />
              <Localize translationKey="pages:profile:squads:manage" />
            </Button>
          ) : (
            <Modal
              title={<Localize translationKey="pages:profile:squads:leaveTitle" />}
              description={<Localize translationKey="pages:profile:squads:leaveDescription" />}
              confirmLabel={<Localize translationKey="pages:profile:squads:leave" />}
              confirmVariant="destructive"
              onCancel
              onConfirm={onLeave}
              trigger={
                <Button variant="transparent" className="flex items-center gap-2">
                  <FiLogOut />
                  <Localize translationKey="pages:profile:squads:leave" />
                </Button>
              }
            />
          )}
        </div>
      </div>
    </article>
  );
});

/* ------------------------------- tab -------------------------------- */

/** Profile → "Squads": squads the user owns or is in. */
const ProfileSquads = observer(() => {
  const [managedId, setManagedId] = useState<string | null>(null);

  useEffect(() => {
    if (!squadsEntity.isLoaded) squadsEntity.load();
  }, []);

  const { items, isLoaded, error } = squadsEntity;

  const renderList = () => {
    if (!isLoaded) {
      if (error) {
        return (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-white/60 border border-dashed border-white/15">
            <p role="alert">
              <Localize translationKey="pages:profile:squads:loadError" />
            </p>
            <Button variant="orange" onClick={squadsEntity.load}>
              <Localize translationKey="pages:profile:filters:retry" />
            </Button>
          </div>
        );
      }

      return Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-[110px] w-full" />);
    }

    if (!items.length) {
      return (
        <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-white/60 border border-dashed border-white/15">
          <p>
            <Localize translationKey="pages:profile:squads:empty" />
          </p>
        </div>
      );
    }

    return items.map((squad) => (
      <SquadCard key={squad.id} squad={squad} onManage={() => setManagedId(squad.id)} />
    ));
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 text-lg font-medium uppercase">
          <Localize translationKey="pages:profile:squads:title" />
          {isLoaded && (
            <span className="text-sm font-normal text-white/50 tabular-nums">{items.length}</span>
          )}
        </h2>
        <CreateSquadButton />
      </div>

      <div className="flex flex-col gap-4">{renderList()}</div>

      {managedId && (
        <ManageSquadDialog
          squadId={managedId}
          open
          onOpenChange={(open) => !open && setManagedId(null)}
        />
      )}
    </>
  );
});

export { ProfileSquads };
