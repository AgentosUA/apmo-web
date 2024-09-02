'use client';

import * as yup from 'yup';

import { observer } from 'mobx-react-lite';

import { Header } from '@/widgets/header';

import { Footer } from '@/widgets/footer';

import styles from './page.module.scss';
import Image from 'next/image';
import { userEntity } from '@/entities/user/model';
import { useEffect } from 'react';
import { useUnAuthorizated } from '@/entities/user/ui/authorization/hook';
import { mapList } from '@/shared/data/map-list';
import { Button } from '@/shared/ui/atoms/button';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';
import { useRouter } from 'next/navigation';
import { apmoApi, Plan } from '@/shared/sdk';
import { Modal } from '@/shared/ui/moleculas/modal/ui';
import Link from 'next/link';
import { Preloader } from '@/shared/ui/quarks/preloader';
import { Input } from '@/shared/ui/atoms/input/ui';
import { useFormik } from 'formik';

const Profile = observer(() => {
  useUnAuthorizated(userEntity);

  useEffect(() => {
    userEntity.getUser();
  }, []);

  const router = useRouter();

  const onCopyMarkers = (plan: Plan) => {
    navigator.clipboard.writeText(plan.planMarkers);

    toasterEntity.call({
      title: 'Markers copied',
      description: 'Markers copied to clipboard',
    });
  };

  const onCopySlots = (plan: Plan) => {
    if (!plan.mission.slots) return;

    const slots = Object.keys(plan.mission.slots)
      .filter((key) => Boolean(plan.mission.slots[key]))
      .map((key) => `${key}: ${plan.mission.slots[key]}`);

    if (!slots?.length) return;

    navigator.clipboard.writeText(slots.join('\n'));

    toasterEntity.call({
      title: 'Slots copied',
      description: 'Slots copied to clipboard',
    });
  };

  const onViewPlan = (plan: Plan) => {
    router.push(`/plans/${plan.id}`);
  };

  const getPlanImage = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())
        ?.image ?? 'maps/no-island.jpg'
    );
  };

  const getPlanIslandName = (plan: Plan) => {
    return (
      mapList.find((map) => map?.dir === plan?.mission?.island?.toLowerCase())
        ?.name ?? 'Unknown'
    );
  };

  const onDeletePlan = ({ id }: Plan) => {
    apmoApi.plan.delete({ id }).then(() => {
      if (!userEntity.user) return;

      userEntity.user.plans = userEntity.user.plans.filter(
        (plan) => plan.id !== id
      );
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

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <Preloader isLoading={userEntity.isLoadingProfile || !userEntity.user}>
          <div className={styles.user}>
            <div className={styles.avatarWrapper}>
              <img
                width={250}
                height={250}
                src={
                  userEntity?.user?.avatar
                    ? userEntity?.user?.avatar
                    : '/avatar.jpg'
                }
                loading='lazy'
                alt='avatar'
              />
            </div>
            <h2 className={styles.username}>{userEntity?.user?.username}</h2>
            <div className={styles.userActions}>
              <div className={styles.avatarActions}>
                <Input
                  id='avatar'
                  label='Avatar URL'
                  value={formik.values.avatar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.avatar ? formik.errors.avatar : ''}
                />
                <Button onClick={formik.submitForm} variant='orange'>
                  Change avatar
                </Button>
              </div>
              <Link href='/profile/change-password'>
                <Button variant='orange'>Change password</Button>
              </Link>
              <Button variant='orange' onClick={userEntity.logout}>
                Log out
              </Button>
            </div>
          </div>
          <div className={styles.plans}>
            <div className={styles.plansTitle}>My plans</div>

            {userEntity?.user?.plans?.map((plan) => (
              <div key={plan.id} className={styles.plan}>
                <div className={styles.planOverlay} />
                <Image
                  className={styles.planImage}
                  width={645}
                  height={100}
                  src={getPlanImage(plan)}
                  alt='island'
                />
                <h3 className={styles.planTitle}>
                  {plan?.mission?.missionName}
                </h3>
                <div className={styles.planFooter}>
                  <p className={styles.planMap}>{getPlanIslandName(plan)}</p>
                  <div className={styles.planActions}>
                    <Button
                      className={styles.planActionButton}
                      onClick={() => onViewPlan(plan)}
                      variant='bold'>
                      View
                    </Button>
                    <Button
                      className={styles.planActionButton}
                      variant='bold'
                      onClick={() => onCopyMarkers(plan)}>
                      Copy markers
                    </Button>
                    <Button
                      className={styles.planActionButton}
                      variant='bold'
                      onClick={() => onCopySlots(plan)}>
                      Copy slots
                    </Button>
                    <Modal
                      title='Delete plan'
                      description='Are you sure you want to delete this plan?'
                      onConfirm={() => onDeletePlan(plan)}
                      onCancel
                      trigger={
                        <Button
                          className={styles.planActionButton}
                          variant='red'>
                          Delete
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
