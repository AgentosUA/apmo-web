'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BsXLg } from 'react-icons/bs';

import { planEntity } from '@/entities/plan';
import { PrincipalSearch, SquadLogo, type Principal } from '@/features/principal-search';
import {
  getApiErrorMessage,
  type AccessLevel,
  type PlanAccess,
  type PublicUser,
  type SquadSummary,
} from '@/shared/sdk';
import { Avatar } from '@/shared/ui/atoms/avatar';
import { Button } from '@/shared/ui/atoms/button';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';

type Rule = {
  level: AccessLevel;
  users: PublicUser[];
  squads: SquadSummary[];
};

type Draft = { read: Rule; edit: Rule };

const DEFAULT_DRAFT: Draft = {
  read: { level: 'public', users: [], squads: [] },
  edit: { level: 'restricted', users: [], squads: [] },
};

const toDraft = (access: PlanAccess | null): Draft =>
  access
    ? {
        read: { ...access.read, users: [...access.read.users], squads: [...access.read.squads] },
        edit: { ...access.edit, users: [...access.edit.users], squads: [...access.edit.squads] },
      }
    : DEFAULT_DRAFT;

const keysOf = (rule: Rule) => [
  ...rule.users.map((user) => `user:${user.id}`),
  ...rule.squads.map((squad) => `squad:${squad.id}`),
];

const Chip = ({ children, onRemove }: { children: ReactNode; onRemove: () => void }) => {
  const { t } = useTranslation();

  return (
    <li className="flex items-center gap-1.5 bg-white/10 py-0.5 pl-1 pr-1.5 text-sm text-white">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('features:planAccess:remove')}
        className="ml-1 text-white/50 hover:text-white"
      >
        <BsXLg className="text-[10px]" />
      </button>
    </li>
  );
};

const LevelOption = ({
  name,
  value,
  checked,
  disabled,
  onChange,
  title,
  hint,
}: {
  name: string;
  value: AccessLevel;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: AccessLevel) => void;
  title: ReactNode;
  hint: ReactNode;
}) => (
  <label
    className={cn(
      'flex cursor-pointer items-start gap-2.5 border border-white/10 px-3 py-2 transition-colors',
      checked ? 'border-a3-orange bg-a3-orange/10' : 'hover:border-white/30',
      disabled && 'cursor-not-allowed opacity-50'
    )}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={() => onChange(value)}
      className="mt-1 accent-[var(--color-a3-orange)]"
    />
    <span className="flex flex-col">
      <span className="text-sm text-white">{title}</span>
      <span className="text-xs text-white/50">{hint}</span>
    </span>
  </label>
);

const RuleSection = ({
  kind,
  rule,
  onChange,
  forcedPublic,
}: {
  kind: 'read' | 'edit';
  rule: Rule;
  onChange: (rule: Rule) => void;
  /** View is public when editing is public. */
  forcedPublic?: boolean;
}) => {
  const { t } = useTranslation();

  const level = forcedPublic ? 'public' : rule.level;

  const onSelect = (item: Principal) => {
    if (item.kind === 'user') {
      onChange({ ...rule, users: [...rule.users, item.user] });
    } else {
      onChange({ ...rule, squads: [...rule.squads, item.squad] });
    }
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-xs uppercase tracking-[0.08em] text-white/60">
        <Localize translationKey={`features:planAccess:${kind}Title`} />
      </legend>

      <div className="grid gap-2 tablet:grid-cols-1 grid-cols-2">
        <LevelOption
          name={`access-${kind}`}
          value="public"
          checked={level === 'public'}
          onChange={(value) => onChange({ ...rule, level: value })}
          title={<Localize translationKey="features:planAccess:public" />}
          hint={<Localize translationKey={`features:planAccess:${kind}PublicHint`} />}
        />
        <LevelOption
          name={`access-${kind}`}
          value="restricted"
          checked={level === 'restricted'}
          disabled={forcedPublic}
          onChange={(value) => onChange({ ...rule, level: value })}
          title={<Localize translationKey="features:planAccess:restricted" />}
          hint={<Localize translationKey={`features:planAccess:${kind}RestrictedHint`} />}
        />
      </div>

      {forcedPublic && (
        <p className="text-xs text-white/50">
          <Localize translationKey="features:planAccess:readForcedPublic" />
        </p>
      )}

      {level === 'restricted' && (
        <div className="flex flex-col gap-2">
          <PrincipalSearch excludeKeys={keysOf(rule)} onSelect={onSelect} />

          {rule.users.length + rule.squads.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {rule.squads.map((squad) => (
                <Chip
                  key={`squad:${squad.id}`}
                  onRemove={() =>
                    onChange({
                      ...rule,
                      squads: rule.squads.filter((item) => item.id !== squad.id),
                    })
                  }
                >
                  <SquadLogo squad={squad} size={18} />
                  <span className="text-a3-orange">[{squad.tag}]</span>
                  <span className="max-w-[160px] truncate">{squad.name}</span>
                </Chip>
              ))}
              {rule.users.map((user) => (
                <Chip
                  key={`user:${user.id}`}
                  onRemove={() =>
                    onChange({ ...rule, users: rule.users.filter((item) => item.id !== user.id) })
                  }
                >
                  <Avatar name={user.username} src={user.avatar} size={18} />
                  <span className="max-w-[160px] truncate">{user.username}</span>
                </Chip>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/50">{t(`features:planAccess:${kind}OnlyOwner`)}</p>
          )}
        </div>
      )}
    </fieldset>
  );
};

const AccessForm = observer(({ onDone }: { onDone: () => void }) => {
  const [draft, setDraft] = useState<Draft>(() => toDraft(planEntity.access));
  const [isSaving, setIsSaving] = useState(false);

  const isEditPublic = draft.edit.level === 'public';

  const onSave = async () => {
    const toIds = (rule: Rule, level: AccessLevel) => ({
      level,
      users: level === 'restricted' ? rule.users.map((user) => user.id) : [],
      squads: level === 'restricted' ? rule.squads.map((squad) => squad.id) : [],
    });

    try {
      setIsSaving(true);

      await planEntity.updateAccess({
        read: toIds(draft.read, isEditPublic ? 'public' : draft.read.level),
        edit: toIds(draft.edit, draft.edit.level),
      });

      toasterEntity.call({
        title: 'features:planAccess:savedTitle',
        description: 'features:planAccess:savedDescription',
      });

      onDone();
    } catch (error) {
      toasterEntity.call({
        title: 'features:planAccess:saveFailed',
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-[25px]">
      <RuleSection
        kind="read"
        rule={draft.read}
        forcedPublic={isEditPublic}
        onChange={(read) => setDraft((value) => ({ ...value, read }))}
      />
      <RuleSection
        kind="edit"
        rule={draft.edit}
        onChange={(edit) => setDraft((value) => ({ ...value, edit }))}
      />

      <p className="text-xs text-white/50">
        <Localize translationKey="features:planAccess:ownerHint" />
      </p>

      <div className="flex justify-between gap-2.5">
        <Dialog.Close asChild>
          <Button type="button" variant="transparent">
            <Localize translationKey="common:cancel" />
          </Button>
        </Dialog.Close>
        <Button
          type="button"
          variant="orange"
          onClick={onSave}
          disabled={isSaving}
          aria-busy={isSaving}
        >
          <Localize translationKey={isSaving ? 'common:loading' : 'features:planAccess:save'} />
        </Button>
      </div>
    </div>
  );
});

/**
 * Plan access settings (owner only), like sharing in Google Docs / Notion:
 * view and edit are set separately — public by link, or only the chosen
 * users and squads.
 */
const PlanAccessDialog = ({ trigger }: { trigger: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 fixed inset-0 animate-overlayShow z-[1100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[94vw] max-w-[620px] max-h-[90svh] overflow-y-auto z-[1101] -translate-x-1/2 -translate-y-1/2 bg-a3-black animate-contentShow focus:outline-none">
          <Dialog.Title className="m-0 pl-[7px] h-[25px] leading-[25px] font-normal uppercase text-white text-sm bg-a3-orange">
            <Localize translationKey="features:planAccess:title" />
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            <Localize translationKey="features:planAccess:description" />
          </Dialog.Description>
          {isOpen && <AccessForm onDone={() => setIsOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { PlanAccessDialog };
