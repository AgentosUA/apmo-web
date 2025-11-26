'use client';

import { useFormik } from 'formik';
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

  // const styledButton = styled(Button,)

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header />
      <main className="flex gap-[25px] flex-nowrap my-[45px] mx-auto p-[15px] w-full max-w-[950px] min-h-[650px] text-white bg-black/70 max-[1199px]:flex-wrap max-[1199px]:flex-col max-[1199px]:items-center paper">
        <Preloader isLoading={userEntity.isLoadingProfile || !userEntity.user}>
          <div className="w-[250px] flex flex-col text-center gap-[15px] min-[1200px]:h-fit min-[1200px]:sticky min-[1200px]:top-[100px]">
            <div className="relative w-[250px] h-[250px] overflow-hidden">
              <img
                width={250}
                height={250}
                src={userEntity?.user?.avatar ? userEntity?.user?.avatar : '/avatar.jpg'}
                loading="lazy"
                alt="avatar"
              />
            </div>
            <h2 className="text-base font-normal">{userEntity?.user?.username}</h2>
            <div className="flex flex-col justify-center gap-[15px] [&_button]:w-full">
              <div className="flex justify-end flex-col h-auto w-full left-0 bottom-0 z-[1]">
                <Input
                  id="avatar"
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
          <div className="flex flex-col text-left w-full max-w-[645px] gap-[18px]">
            <div className="flex justify-between">
              <div className="text-lg font-normal">
                <Localize translationKey="pages:profile:myPlans" />
              </div>
              {/* <div>
                <Button variant="primary">Фільтри</Button>
              </div> */}
            </div>

            {userEntity?.user?.plans?.map((plan) => (
              <div
                key={plan.id}
                className="relative flex flex-col min-h-[100px] max-[1199px]:min-h-[210px] w-full p-[10px] overflow-hidden border border-white/20 border-solid"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[2]" />
                <Image
                  className="object-cover w-full h-full absolute top-0 left-0 z-[1]"
                  width={645}
                  height={100}
                  src={getPlanImage(plan)}
                  alt="island"
                />
                <div className="z-[3]">
                  <h3 className="text-lg font-semibold">{plan?.mission?.missionName}</h3>
                  <div className="mt-auto flex flex-col flex-wrap">
                    <p className="text-sm font-normal">{getPlanIslandName(plan)}</p>
                    <div className="mt-[10px] mr-auto flex justify-between items-center gap-[15px] max-[1199px]:flex-col">
                      <Button
                        className="h-7 text-xs text-left w-fit pr-2 flex items-center gap-2"
                        onClick={() => onViewPlan(plan)}
                        variant="default"
                      >
                        <BsEye />
                        <Localize translationKey="pages:profile:viewPlan" />
                      </Button>
                      <Button
                        className="h-7 text-xs text-left w-fit pr-2 flex items-center gap-2"
                        variant="default"
                        onClick={() => onCopyMarkers(plan)}
                      >
                        <BsCopyIcon />
                        <Localize translationKey="pages:profile:copyMarkers" />
                      </Button>
                      <Button
                        className="h-7 text-xs text-left w-fit pr-2 flex items-center gap-2"
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
                          <Button
                            className="h-7 text-xs text-left w-fit pr-2 flex items-center gap-2"
                            variant="destructive"
                          >
                            <BsTrash />
                            <Localize translationKey="pages:profile:deletePlan" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Preloader>
      </main>
      <Footer />
    </div>
  );
});

export default Profile;
