'use client';

import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  BsCopy as BsCopyIcon,
  BsEye,
  BsSortDown,
  BsSortUp,
  BsTrash,
  BsUpload,
  BsXLg,
} from 'react-icons/bs';

import { userEntity } from '@/entities/user/model';
import { profilePlansEntity } from '@/entities/user/plans-model';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { LogoutConfirm } from '@/features/user/logout';
import { getWorldDisplayName } from '@/shared/lib/ocap/worlds';
import { setServerError, useZodForm } from '@/shared/lib/validation';
import {
  api,
  avatarFileSchema,
  AVATAR_MIME_TYPES,
  changeAvatarRequestSchema,
  getApiErrorMessage,
  type ProfilePlan,
  type ProfilePlanSort,
} from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { WorldPreview } from '@/shared/ui/atoms/world-preview/ui';
import { Paper } from '@/shared/ui/atoms/paper';
import { Skeleton } from '@/shared/ui/atoms/skeleton';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { cn } from '@/shared/utils/cn';
import { ContentPage } from '@/widgets/content-page';
import { ProfileSquads } from '@/widgets/profile-squads';

type Plan = ProfilePlan;

type AvatarForm = ReturnType<typeof useAvatarForm>;

/** One form instance shared by the mobile and desktop panels. */
const useAvatarForm = () => {
  const form = useZodForm(changeAvatarRequestSchema, {
    // Re-syncs when the profile is (re)loaded.
    values: { avatar: userEntity.user?.avatar ?? '' },
  });

  const onSubmit = form.handleSubmit(async ({ avatar }) => {
    try {
      await userEntity.changeAvatar(avatar);

      toasterEntity.call({
        title: 'pages:profile:changeAvatar',
        description: 'pages:profile:avatarChanged',
      });
    } catch (error) {
      setServerError(form, error, 'avatar');
    }
  });

  return { form, onSubmit };
};

const AvatarFields = ({
  avatarForm: { form, onSubmit },
  id,
}: {
  avatarForm: AvatarForm;
  id: string;
}) => {
  const {
    control,
    formState: { isSubmitting, isDirty },
  } = form;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2 w-full text-left">
      {/* Controlled: the mobile and desktop panels are both mounted and share this field. */}
      <Controller
        control={control}
        name="avatar"
        render={({ field, fieldState }) => (
          <Input
            {...field}
            id={id}
            type="url"
            inputMode="url"
            placeholder="https://…/avatar.png"
            label={<Localize translationKey="pages:profile:avatarUrl" />}
            hint={<Localize translationKey="pages:profile:avatarHint" />}
            disabled={isSubmitting}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button
        type="submit"
        variant="orange"
        disabled={isSubmitting || !isDirty}
        aria-busy={isSubmitting}
      >
        <Localize translationKey={isSubmitting ? 'common:loading' : 'pages:profile:changeAvatar'} />
      </Button>
    </form>
  );
};

/** Upload / remove controls. Both panels are mounted, so state lives in `userEntity`. */
const AvatarUpload = observer(({ hasAvatar }: { hasAvatar: boolean }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = userEntity.isUpdatingAvatar;

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Allow choosing the same file again.
    event.target.value = '';

    if (!file) return;

    const parsed = avatarFileSchema.safeParse(file);

    if (!parsed.success) {
      toasterEntity.call({
        title: 'pages:profile:changeAvatar',
        description: parsed.error.issues[0]?.message ?? 'pages:profile:avatarInvalidType',
      });
      return;
    }

    try {
      await userEntity.uploadAvatar(file);

      toasterEntity.call({
        title: 'pages:profile:changeAvatar',
        description: 'pages:profile:avatarChanged',
      });
    } catch (error) {
      toasterEntity.call({
        title: 'pages:profile:changeAvatar',
        description: getApiErrorMessage(error),
      });
    }
  };

  const onRemove = async () => {
    try {
      await userEntity.removeAvatar();

      toasterEntity.call({
        title: 'pages:profile:removeAvatar',
        description: 'pages:profile:avatarRemoved',
      });
    } catch (error) {
      toasterEntity.call({
        title: 'pages:profile:removeAvatar',
        description: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_MIME_TYPES.join(',')}
        className="hidden"
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="orange"
          className="flex-1 min-w-0 flex items-center justify-center gap-2"
          disabled={isBusy}
          aria-busy={isBusy}
          onClick={() => inputRef.current?.click()}
        >
          <BsUpload aria-hidden />
          <Localize translationKey={isBusy ? 'common:loading' : 'pages:profile:uploadAvatar'} />
        </Button>
        {hasAvatar && (
          <Modal
            title={<Localize translationKey="pages:profile:removeAvatar" />}
            onConfirm={onRemove}
            onCancel
            confirmVariant="destructive"
            trigger={
              <Button
                type="button"
                variant="destructive"
                className="!min-w-0 !h-8 !w-8 shrink-0 !p-0 flex items-center justify-center"
                disabled={isBusy}
                title={t('pages:profile:removeAvatar')}
                aria-label={t('pages:profile:removeAvatar')}
              >
                <BsXLg aria-hidden />
              </Button>
            }
          />
        )}
      </div>
      <p className="text-xs text-white/45">
        <Localize translationKey="pages:profile:avatarFileHint" />
      </p>
    </div>
  );
});

type PlanCardProps = {
  plan: Plan;
  getPlanImage: (plan: Plan) => string;
  getPlanIslandName: (plan: Plan) => string;
  onViewPlan: (plan: Plan) => void;
  onCopyMarkers: (plan: Plan) => void;
  onCopySlots: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  variant: 'mobile' | 'desktop';
};

const MOBILE_PLAN_ACTION = 'h-10 min-w-0 w-full text-xs flex items-center justify-start gap-2 px-3';

const DESKTOP_PLAN_ACTION = 'h-7 text-xs text-left w-fit pr-2 flex items-center gap-2';

const formatDate = (value?: string) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : null);

const PlanDates = ({ plan }: { plan: Plan }) => {
  const created = formatDate(plan.createdAt);
  const updated = formatDate(plan.updatedAt);

  if (!created) return null;

  return (
    <p className="text-xs text-white/60 tabular-nums flex flex-wrap gap-x-3">
      <span>
        <Localize translationKey="pages:profile:created" />: {created}
      </span>
      {updated && updated !== created && (
        <span>
          <Localize translationKey="pages:profile:updated" />: {updated}
        </span>
      )}
    </p>
  );
};

const PlanCard = ({
  plan,
  getPlanImage,
  getPlanIslandName,
  onViewPlan,
  onCopyMarkers,
  onCopySlots,
  onDeletePlan,
  variant,
}: PlanCardProps) => {
  const isMobile = variant === 'mobile';
  const actionClass = isMobile ? MOBILE_PLAN_ACTION : DESKTOP_PLAN_ACTION;

  return (
    <div
      className={
        isMobile
          ? 'relative flex flex-col min-h-[180px] w-full p-3 overflow-hidden border border-white/20 border-solid'
          : 'relative flex flex-col min-h-[100px] w-full p-[10px] overflow-hidden border border-white/20 border-solid'
      }
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[2]" />
      <WorldPreview
        className="object-cover w-full h-full absolute top-0 left-0 z-[1]"
        width={645}
        height={100}
        worldName={getPlanImage(plan)}
        alt="island"
      />
      <div className="relative z-[3] flex flex-col flex-1">
        <h3 className={isMobile ? 'text-base font-semibold pr-2' : 'text-lg font-semibold'}>
          {plan?.mission?.missionName}
        </h3>
        <div className="mt-auto flex flex-col">
          <p className="text-sm font-normal">{getPlanIslandName(plan)}</p>
          <PlanDates plan={plan} />
          <div
            className={
              isMobile
                ? 'mt-3 grid grid-cols-2 gap-2 mobile:grid-cols-1'
                : 'mt-[10px] mr-auto flex justify-between items-center gap-[15px]'
            }
          >
            <Button className={actionClass} onClick={() => onViewPlan(plan)} variant="default">
              <BsEye />
              <Localize translationKey="pages:profile:viewPlan" />
            </Button>
            <Button className={actionClass} variant="default" onClick={() => onCopyMarkers(plan)}>
              <BsCopyIcon />
              <Localize translationKey="pages:profile:copyMarkers" />
            </Button>
            <Button className={actionClass} variant="default" onClick={() => onCopySlots(plan)}>
              <BsCopyIcon />
              <Localize translationKey="pages:profile:copySlots" />
            </Button>
            <Modal
              title="Delete plan"
              description="Are you sure you want to delete this plan?"
              onConfirm={() => onDeletePlan(plan)}
              onCancel
              trigger={
                <Button className={actionClass} variant="destructive">
                  <BsTrash />
                  <Localize translationKey="pages:profile:deletePlan" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/** The URL field is secondary to the upload, so it is collapsed by default. */
const AvatarUrlDetails = ({ children }: { children: ReactNode }) => (
  <details className="group/url text-left">
    <summary className="cursor-pointer select-none text-xs uppercase tracking-[0.08em] text-white/60 hover:text-white list-none [&::-webkit-details-marker]:hidden">
      <span className="inline-block mr-1 transition-transform group-open/url:rotate-90">›</span>
      <Localize translationKey="pages:profile:avatarOrUrl" />
    </summary>
    <div className="mt-2">{children}</div>
  </details>
);

type UserPanelProps = {
  username?: string;
  avatar?: string;
  avatarForm: AvatarForm;
  variant: 'mobile' | 'desktop';
};

const UserPanel = ({ username, avatar, avatarForm, variant }: UserPanelProps) => {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xs">
            <img
              width={80}
              height={80}
              src={avatar || '/avatar.jpg'}
              loading="lazy"
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="text-lg font-normal break-all">{username}</h2>
        </div>
        <div className="flex flex-col gap-3 [&_button]:w-full">
          <AvatarUpload hasAvatar={Boolean(avatar)} />
          <AvatarUrlDetails>
            <AvatarFields avatarForm={avatarForm} id="avatar-mobile" />
          </AvatarUrlDetails>
          <Link href="/profile/change-password" className="w-full">
            <Button variant="orange" className="w-full">
              <Localize translationKey="pages:profile:changePassword" />
            </Button>
          </Link>
          <LogoutConfirm
            trigger={
              <Button variant="orange" className="w-full">
                <Localize translationKey="pages:profile:logout" />
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-center gap-[15px]">
      <div className="relative w-[250px] h-[250px] overflow-hidden">
        <img width={250} height={250} src={avatar || '/avatar.jpg'} loading="lazy" alt="avatar" />
      </div>
      <h2 className="text-base font-normal">{username}</h2>
      <div className="flex flex-col justify-center gap-[15px] [&_button]:w-full">
        <AvatarUpload hasAvatar={Boolean(avatar)} />
        <AvatarUrlDetails>
          <AvatarFields avatarForm={avatarForm} id="avatar-desktop" />
        </AvatarUrlDetails>
        <Link href="/profile/change-password">
          <Button variant="orange">
            <Localize translationKey="pages:profile:changePassword" />
          </Button>
        </Link>
        <LogoutConfirm
          trigger={
            <Button variant="orange">
              <Localize translationKey="pages:profile:logout" />
            </Button>
          }
        />
      </div>
    </div>
  );
};

const PLAN_SKELETONS = 3;

const PlanCardSkeleton = ({ variant }: { variant: 'mobile' | 'desktop' }) => {
  const isMobile = variant === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'flex flex-col min-h-[180px] w-full p-3 border border-white/10 border-solid bg-white/[0.03]'
          : 'flex flex-col min-h-[100px] w-full p-[10px] border border-white/10 border-solid bg-white/[0.03]'
      }
    >
      <Skeleton className={isMobile ? 'h-5 w-2/3' : 'h-5 w-1/2'} />
      <div className="mt-auto flex flex-col">
        <Skeleton className="mt-3 h-3.5 w-24" />
        <div
          className={
            isMobile
              ? 'mt-3 grid grid-cols-2 gap-2 mobile:grid-cols-1'
              : 'mt-[10px] flex items-center gap-[15px]'
          }
        >
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className={isMobile ? 'h-10 w-full' : 'h-7 w-[127px]'} />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserPanelSkeleton = ({ variant }: { variant: 'mobile' | 'desktop' }) => {
  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 shrink-0" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[15px]">
      <Skeleton className="w-[250px] h-[250px]" />
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col gap-[15px] w-full">
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
};

/** Shared two-column layout: user panel (sticky on desktop) + plans list. */
const ProfileLayout = ({
  panel,
  plans,
  busy,
}: {
  panel: (variant: 'mobile' | 'desktop') => ReactNode;
  plans: ReactNode;
  busy?: boolean;
}) => (
  <div
    aria-busy={busy}
    className="flex flex-col gap-5 desktop:flex-row desktop:items-start desktop:gap-6"
  >
    <Paper as="aside" className="desktop:w-[290px] desktop:shrink-0 desktop:sticky desktop:top-32">
      <div className="desktop:hidden">{panel('mobile')}</div>
      <div className="hidden desktop:block">{panel('desktop')}</div>
    </Paper>
    <Paper as="section" className="flex-1 min-w-0 flex flex-col gap-4">
      {plans}
    </Paper>
  </div>
);

const ProfileSkeleton = () => (
  <ProfileLayout
    busy
    panel={(variant) => <UserPanelSkeleton variant={variant} />}
    plans={
      <>
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: PLAN_SKELETONS }, (_, i) => (
          <div key={i}>
            <div className="desktop:hidden">
              <PlanCardSkeleton variant="mobile" />
            </div>
            <div className="hidden desktop:block">
              <PlanCardSkeleton variant="desktop" />
            </div>
          </div>
        ))}
      </>
    }
  />
);

const SORT_OPTIONS: { value: ProfilePlanSort; labelKey: string }[] = [
  { value: 'createdAt', labelKey: 'pages:profile:filters:sortCreatedAt' },
  { value: 'updatedAt', labelKey: 'pages:profile:filters:sortUpdatedAt' },
  { value: 'missionName', labelKey: 'pages:profile:filters:sortMissionName' },
  { value: 'world', labelKey: 'pages:profile:filters:sortWorld' },
];

const isPlanSort = (value: string): value is ProfilePlanSort =>
  SORT_OPTIONS.some((option) => option.value === value);

/** Search by mission name, world filter and sorting. */
const PlansToolbar = observer(() => {
  const { t } = useTranslation();
  const { filters, worldOptions, hasActiveFilters } = profilePlansEntity;

  const isAsc = filters.order === 'asc';
  const orderLabel = t(
    isAsc ? 'pages:profile:filters:orderAsc' : 'pages:profile:filters:orderDesc'
  );

  return (
    <div
      role="search"
      className="grid grid-cols-1 gap-3 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,1fr)_180px_220px] desktop:items-end"
    >
      <Input
        type="search"
        size="md"
        className="tablet:col-span-2 desktop:col-span-1"
        label={<Localize translationKey="pages:profile:filters:search" />}
        placeholder={t('pages:profile:filters:searchPlaceholder')}
        value={filters.search}
        onChange={(event) => profilePlansEntity.setSearch(event.target.value)}
        maxLength={100}
        autoComplete="off"
      />
      <Select
        label={<Localize translationKey="pages:profile:filters:world" />}
        value={filters.world}
        onChange={(event) => profilePlansEntity.setWorld(event.target.value)}
        options={[
          { value: '', label: t('pages:profile:filters:allWorlds') },
          ...worldOptions.map(({ value, label, count }) => ({
            value,
            label: `${label} (${count})`,
          })),
        ]}
      />
      <div className="flex items-end gap-2">
        <Select
          className="flex-1 min-w-0"
          label={<Localize translationKey="pages:profile:filters:sortBy" />}
          value={filters.sort}
          onChange={(event) => {
            if (isPlanSort(event.target.value)) profilePlansEntity.setSort(event.target.value);
          }}
          options={SORT_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
        />
        <button
          type="button"
          onClick={profilePlansEntity.toggleOrder}
          title={orderLabel}
          aria-label={orderLabel}
          className="h-10 w-10 shrink-0 flex items-center justify-center bg-black/60 text-white/80 border border-solid border-white/15 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:border-a3-orange transition-colors"
        >
          {isAsc ? <BsSortUp aria-hidden /> : <BsSortDown aria-hidden />}
        </button>
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={profilePlansEntity.resetFilters}
          className="justify-self-start text-xs uppercase tracking-[0.08em] text-a3-orange hover:text-white transition-colors tablet:col-span-2 desktop:col-span-3"
        >
          <Localize translationKey="pages:profile:filters:reset" />
        </button>
      )}
    </div>
  );
});

const PROFILE_TABS = ['plans', 'squads'] as const;

type ProfileTab = (typeof PROFILE_TABS)[number];

/** Active tab, kept in `?tab=` so it survives reloads and can be linked. */
const useProfileTab = () => {
  const [tab, setTab] = useState<ProfileTab>('plans');

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('tab');

    if (PROFILE_TABS.includes(value as ProfileTab)) setTab(value as ProfileTab);
  }, []);

  const select = (value: ProfileTab) => {
    setTab(value);

    const url = new URL(window.location.href);

    if (value === 'plans') url.searchParams.delete('tab');
    else url.searchParams.set('tab', value);

    window.history.replaceState(window.history.state, '', url);
  };

  return [tab, select] as const;
};

const ProfileTabs = ({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) => (
  <div role="tablist" className="flex gap-1 border-b border-white/10">
    {PROFILE_TABS.map((tab) => (
      <button
        key={tab}
        type="button"
        role="tab"
        id={`profile-tab-${tab}`}
        aria-selected={active === tab}
        aria-controls={`profile-panel-${tab}`}
        onClick={() => onChange(tab)}
        className={cn(
          '-mb-px border-b-2 px-3 py-2 text-sm uppercase tracking-[0.08em] transition-colors',
          active === tab
            ? 'border-a3-orange text-white'
            : 'border-transparent text-white/50 hover:text-white'
        )}
      >
        <Localize translationKey={`pages:profile:tabs:${tab}`} />
      </button>
    ))}
  </div>
);

const PlansEmpty = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-white/60 border border-dashed border-white/15">
    {children}
  </div>
);

const Profile = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
    profilePlansEntity.load();
  }, []);

  const router = useRouter();
  const [tab, setTab] = useProfileTab();

  const onCopyMarkers = (plan: Plan) => {
    navigator.clipboard.writeText(plan.planMarkers);

    toasterEntity.call({
      title: 'entities:markers:copiedTitle',
      description: 'entities:markers:copiedDescription',
    });
  };

  const onCopySlots = (plan: Plan) => {
    const missionSlots = plan.mission?.slots;

    if (!missionSlots) return;

    const slots = Object.entries(missionSlots)
      .filter(([, squad]) => Boolean(squad))
      .map(([callsign, squad]) => `${callsign}: ${squad}`);

    navigator.clipboard.writeText(slots.join('\n'));

    toasterEntity.call({
      title: 'entities:slots:copiedTitle',
      description: 'entities:slots:copiedDescription',
    });
  };

  const onViewPlan = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const getPlanImage = (plan: Plan) => plan?.mission?.island ?? '';

  const getPlanIslandName = (plan: Plan) => getWorldDisplayName(plan?.mission?.island);

  const onDeletePlan = async ({ id }: Plan) => {
    try {
      await api.plans.remove({ id });
      userEntity.removePlan(id);
      profilePlansEntity.removePlan(id);
    } catch (error) {
      toasterEntity.call({
        title: 'pages:profile:deletePlan',
        description: getApiErrorMessage(error),
      });
    }
  };

  const avatarForm = useAvatarForm();

  const planCardProps = {
    getPlanImage,
    getPlanIslandName,
    onViewPlan,
    onCopyMarkers,
    onCopySlots,
    onDeletePlan,
  };

  const userPanelProps = {
    username: userEntity?.user?.username,
    avatar: userEntity?.user?.avatar ?? undefined,
    avatarForm,
  };

  const isLoading = userEntity.isLoadingProfile || !userEntity.user;

  const plans = profilePlansEntity;

  const renderPlans = () => {
    if (!plans.isLoaded) {
      if (plans.error) {
        return (
          <PlansEmpty>
            <p role="alert">
              <Localize translationKey="pages:profile:filters:loadError" />
            </p>
            <Button variant="orange" onClick={plans.load}>
              <Localize translationKey="pages:profile:filters:retry" />
            </Button>
          </PlansEmpty>
        );
      }

      return Array.from({ length: PLAN_SKELETONS }, (_, i) => (
        <div key={i}>
          <div className="desktop:hidden">
            <PlanCardSkeleton variant="mobile" />
          </div>
          <div className="hidden desktop:block">
            <PlanCardSkeleton variant="desktop" />
          </div>
        </div>
      ));
    }

    if (plans.items.length === 0) {
      return (
        <PlansEmpty>
          {plans.hasActiveFilters ? (
            <>
              <p>
                <Localize translationKey="pages:profile:filters:noResults" />
              </p>
              <Button variant="orange" onClick={plans.resetFilters}>
                <Localize translationKey="pages:profile:filters:reset" />
              </Button>
            </>
          ) : (
            <p>
              <Localize translationKey="pages:profile:filters:noPlans" />
            </p>
          )}
        </PlansEmpty>
      );
    }

    return (
      <div
        aria-busy={plans.isLoading}
        aria-live="polite"
        className={cn(
          'flex flex-col gap-4 transition-opacity',
          plans.isLoading && 'opacity-60 pointer-events-none'
        )}
      >
        {plans.sortedItems.map((plan) => (
          <div key={plan.id}>
            <div className="desktop:hidden">
              <PlanCard plan={plan} {...planCardProps} variant="mobile" />
            </div>
            <div className="hidden desktop:block">
              <PlanCard plan={plan} {...planCardProps} variant="desktop" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ContentPage
      width="lg"
      title={<Localize translationKey="widgets:header:profile" />}
      subtitle={userEntity.user?.username}
    >
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <ProfileLayout
          panel={(variant) => <UserPanel {...userPanelProps} variant={variant} />}
          plans={
            <>
              <ProfileTabs active={tab} onChange={setTab} />
              {tab === 'squads' ? (
                <div
                  role="tabpanel"
                  id="profile-panel-squads"
                  aria-labelledby="profile-tab-squads"
                  className="flex flex-col gap-4"
                >
                  <ProfileSquads />
                </div>
              ) : (
                <div
                  role="tabpanel"
                  id="profile-panel-plans"
                  aria-labelledby="profile-tab-plans"
                  className="flex flex-col gap-4"
                >
                  <h2 className="flex items-baseline gap-2 text-lg font-medium uppercase">
                    <Localize translationKey="pages:profile:myPlans" />
                    <span className="text-sm font-normal text-white/50 tabular-nums">
                      {plans.hasActiveFilters && plans.isLoaded
                        ? `${plans.total} / ${plans.totalAll}`
                        : plans.totalAll}
                    </span>
                  </h2>
                  {(plans.totalAll > 0 || plans.hasActiveFilters) && <PlansToolbar />}
                  {renderPlans()}
                </div>
              )}
            </>
          }
        />
      )}
    </ContentPage>
  );
});

export default Profile;
