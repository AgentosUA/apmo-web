'use client';

import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BsCopy as BsCopyIcon } from 'react-icons/bs';
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
import { styled } from '@/shared/utils/react';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

import styles from './page.module.scss';

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

      userEntity.user.plans = userEntity.user.plans.filter((plan) => plan.id !== id);
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
      <main className="flex gap-5 flex-wrap items-center max-w-screen-lg w-full mx-auto bg-black/70 p-4 text-white">
        <Preloader isLoading={userEntity.isLoadingProfile || !userEntity.user}>
          <div className={styles.user}>
            <div className={styles.avatarWrapper}>
              <img
                width={250}
                height={250}
                src={userEntity?.user?.avatar ? userEntity?.user?.avatar : '/avatar.jpg'}
                loading="lazy"
                alt="avatar"
              />
            </div>
            <h2 className={styles.username}>{userEntity?.user?.username}</h2>
            <div className={styles.userActions}>
              <div className={styles.avatarActions}>
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
          <div className={styles.plans}>
            <div className={styles.plansTitle}>
              <Localize translationKey="pages:profile:myPlans" />
            </div>

            {userEntity?.user?.plans?.map((plan) => (
              <div key={plan.id} className={styles.plan}>
                <div className={styles.planOverlay} />
                <Image
                  className={styles.planImage}
                  width={645}
                  height={100}
                  src={getPlanImage(plan)}
                  alt="island"
                />
                <h3 className={styles.planTitle}>{plan?.mission?.missionName}</h3>
                <div className={styles.planFooter}>
                  <p className={styles.planMap}>{getPlanIslandName(plan)}</p>
                  <div className={styles.planActions}>
                    <Button
                      className={styles.planActionButton}
                      onClick={() => onViewPlan(plan)}
                      variant="bold"
                    >
                      <Localize translationKey="pages:profile:viewPlan" />
                    </Button>
                    <Button
                      className={styles.planActionButton}
                      variant="bold"
                      onClick={() => onCopyMarkers(plan)}
                    >
                      <BsCopyIcon />
                      <Localize translationKey="pages:profile:copyMarkers" />
                    </Button>
                    <Button
                      className={styles.planActionButton}
                      variant="bold"
                      onClick={() => onCopySlots(plan)}
                    >
                      <Localize translationKey="pages:profile:copySlots" />
                    </Button>
                    <Modal
                      title="Delete plan"
                      description="Are you sure you want to delete this plan?"
                      onConfirm={() => onDeletePlan(plan)}
                      onCancel
                      trigger={
                        <Button className={styles.planActionButton} variant="red">
                          <Localize translationKey="pages:profile:deletePlan" />
                        </Button>
                      }
                    />
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
