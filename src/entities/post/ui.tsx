import type { FC, PropsWithChildren } from 'react';

import { Card } from '@/shared/ui/atoms/card';

import dayjs from 'dayjs';

import Image from 'next/image';

import { View } from '@/shared/ui/quarks/view';

import styles from './ui.module.scss';

const Post: FC<
  PropsWithChildren<{
    title: string;
    date: Date | string;
    imageUrl?: string;
  }>
> = ({ title, date, imageUrl, children }) => (
  <Card className={styles.post}>
    <header className={styles.header}>
      <h2>{title}</h2>
      <span className={styles.date}>{dayjs(date).format('DD.MM.YYYY')}</span>
    </header>
    <View.Condition if={Boolean(imageUrl)}>
      <img className={styles.image} src={imageUrl!} alt='post image' />
    </View.Condition>
    <main className={styles.content}>{children}</main>
  </Card>
);

export { Post };
