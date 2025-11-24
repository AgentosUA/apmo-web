import dayjs from 'dayjs';
import type { FC, PropsWithChildren } from 'react';

import { Card } from '@/shared/ui/atoms/card';
import { View } from '@/shared/ui/quarks/view';
import { cn } from '@/shared/utils/cn';

import styles from './ui.module.scss';

const Post: FC<
  PropsWithChildren<{
    title: string;
    date: Date | string;
    imageUrl?: string;
  }>
> = ({ title, date, imageUrl, children }) => (
  <Card className="paper p-7 flex flex-col flex-wrap overflow-hidden leading-6">
    <header className="leading-6 font-bold">
      <h2>{title}</h2>
      <span className={styles.date}>{dayjs(date).format('DD.MM.YYYY')}</span>
    </header>
    <View.Condition if={Boolean(imageUrl)}>
      <img className="w-full object-cover" src={imageUrl!} alt="post image" />
    </View.Condition>
    <main className={cn(styles.post, 'mt-6')}>{children}</main>
  </Card>
);

export { Post };
