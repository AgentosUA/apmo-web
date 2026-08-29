'use client';

import { useFormik, type FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BsCopy as BsCopyIcon, BsEye, BsTrash } from 'react-icons/bs';
import * as yup from 'yup';

import { Callsigns } from '@/entities/mission/types';
import { userEntity } from '@/entities/user/model';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { mapList } from '@/shared/data/map-list';
import { apmoApi, Plan } from '@/shared/sdk';
import { Button } from '@/shared/ui/atoms/button';
import { Input } from '@/shared/ui/atoms/input/ui';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { Localize } from '@/shared/ui/quarks/localize/ui';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

type AvatarFormValues = { avatar: string };

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

const MOBILE_PLAN_ACTION =
  'h-10 min-w-0 w-full text-xs flex items-center justify-start gap-2 px-3';

const DESKTOP_PLAN_ACTION =
  'h-7 text-xs text-left w-fit pr-2 flex items-center gap-2';

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
      <Image
        className="object-cover w-full h-full absolute top-0 left-0 z-[1]"
        width={645}
        height={100}
        src={getPlanImage(plan)}
        alt="island"
      />
      <div className="relative z-[3] flex flex-col flex-1">
        <h3 className={isMobile ? 'text-base font-semibold pr-2' : 'text-lg font-semibold'}>
          {plan?.mission?.missionName}
        </h3>
        <div className="mt-auto flex flex-col">
          <p className="text-sm font-normal">{getPlanIslandName(plan)}</p>
          <div
            className={
              isMobile
                ? 'mt-3 grid grid-cols-2 gap-2 mobile:grid-cols-1'
                : 'mt-[10px] mr-auto flex justify-between items-center gap-[15px]'
            }
          >
            <Button
              className={actionClass}
              onClick={() => onViewPlan(plan)}
              variant="default"
            >
              <BsEye />
              <Localize translationKey="pages:profile:viewPlan" />
            </Button>
            <Button
              className={actionClass}
              variant="default"
              onClick={() => onCopyMarkers(plan)}
            >
              <BsCopyIcon />
              <Localize translationKey="pages:profile:copyMarkers" />
            </Button>
            <Button
              className={actionClass}
              variant="default"
              onClick={() => onCopySlots(plan)}
            >
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

type UserPanelProps = {
  username?: string;
  avatar?: string;
  formik: FormikProps<AvatarFormValues>;
  variant: 'mobile' | 'desktop';
};

const UserPanel = ({ username, avatar, formik, variant }: UserPanelProps) => {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-sm">
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
          <Input
            id="avatar-mobile"
            name="avatar"
            label={<Localize translationKey="pages:profile:avatarUrl" />}
            value={formik.values.avatar}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.avatar ? formik.errors.avatar : ''}
          />
          <Button onClick={formik.submitForm} variant="orange">
            <Localize translationKey="pages:profile:changeAvatar" />
          </Button>
          <Link href="/profile/change-password" className="w-full">
            <Button variant="orange" className="w-full">
              <Localize translationKey="pages:profile:changePassword" />
            </Button>
          </Link>
          <Button variant="orange" onClick={userEntity.logout} className="w-full">
            <Localize translationKey="pages:profile:logout" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[250px] flex flex-col text-center gap-[15px] h-fit sticky top-[100px]">
      <div className="relative w-[250px] h-[250px] overflow-hidden">
        <img
          width={250}
          height={250}
          src={avatar || '/avatar.jpg'}
          loading="lazy"
          alt="avatar"
        />
      </div>
      <h2 className="text-base font-normal">{username}</h2>
      <div className="flex flex-col justify-center gap-[15px] [&_button]:w-full">
        <div className="flex justify-end flex-col h-auto w-full">
          <Input
            id="avatar-desktop"
            name="avatar"
            label={<Localize translationKey="pages:profile:avatarUrl" />}
            value={formik.values.avatar}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.avatar ? formik.errors.avatar : ''}
          />
          <Button onClick={formik.submitForm} variant="orange">
            <Localize translationKey="pages:profile:changeAvatar" />
          </Button>
        </div>
        <Link href="/profile/change-password">
          <Button variant="orange">
            <Localize translationKey="pages:profile:changePassword" />
          </Button>
        </Link>
        <Button variant="orange" onClick={userEntity.logout}>
          <Localize translationKey="pages:profile:logout" />
        </Button>
      </div>
    </div>
  );
};

const Profile = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const router = useRouter();

  const onCopyMarkers = (plan: Plan) => {
    navigator.clipboard.writeText(plan.planMarkers);

    toasterEntity.call({
      title: 'entities:markers:copiedTitle',
      description: 'entities:markers:copiedDescription',
    });
  };

  const onCopySlots = (plan: Plan) => {
    if (!plan.mission.slots) return;

    const slots = Object.keys(plan.mission.slots)
      .filter((key) => Boolean(plan?.mission?.slots?.[key as keyof Callsigns]))
      .map((key) => `${key}: ${plan?.mission?.slots?.[key as keyof Callsigns]}`);

    navigator.clipboard.writeText(slots.join('\n'));

    toasterEntity.call({
      title: 'entities:slots:copiedTitle',
      description: 'entities:slots:copiedDescription',
    });
  };

  const onViewPlan = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const getPlanImage = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())?.image ??
      'maps/no-island.jpg'
    );
  };

  const getPlanIslandName = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())?.name ?? 'Unknown'
    );
  };

  const onDeletePlan = ({ id }: Plan) => {
    apmoApi.plan.delete({ id }).then(() => {
      if (!userEntity.user) return;

      userEntity.user.plans = userEntity.user.plans.filter((plan) => plan.id == id);
    });
  };

  const validationSchema = yup.object({
    avatar: yup
      .string()
      .url('Invalid image url')
      .matches(/\.(jpeg|jpg|gif|png)$/, 'Invalid image url'),
  });

  const formik = useFormik({
    initialValues: {
      avatar: userEntity?.user?.avatar ?? '',
    },
    validationSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    onSubmit: () => {
      userEntity.changeAvatar(formik.values.avatar);
    },
  });

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
    avatar: userEntity?.user?.avatar,
    formik,
  };

  return (
    <div className="flex flex-col h-full min-h-screen min-h-svh">
      <Header />
      <Preloader isLoading={userEntity.isLoadingProfile || !userEntity.user}>
        <main className="desktop:hidden flex flex-col gap-5 mx-auto px-4 py-5 w-full text-white bg-black/70 paper">
          <UserPanel {...userPanelProps} variant="mobile" />
          <div className="flex flex-col text-left w-full gap-4">
            <h2 className="text-lg font-normal">
              <Localize translationKey="pages:profile:myPlans" />
            </h2>
            {userEntity?.user?.plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} {...planCardProps} variant="mobile" />
            ))}
          </div>
        </main>

        <main className="hidden desktop:flex gap-[25px] flex-nowrap my-[45px] mx-auto p-[15px] w-full max-w-[950px] min-h-[650px] text-white bg-black/70 paper">
          <UserPanel {...userPanelProps} variant="desktop" />
          <div className="flex flex-col text-left w-full max-w-[645px] gap-[18px]">
            <div className="text-lg font-normal">
              <Localize translationKey="pages:profile:myPlans" />
            </div>
            {userEntity?.user?.plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} {...planCardProps} variant="desktop" />
            ))}
          </div>
        </main>
      </Preloader>
      <Footer />
    </div>
  );
});

export default Profile;
