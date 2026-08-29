import dayjs from 'dayjs';
import type { FC, PropsWithChildren } from 'react';

import { Card } from '@/shared/ui/atoms/card';
import { View } from '@/shared/ui/quarks/view';

const Post: FC<
  PropsWithChildren<{
    title: string;
    date: Date | string;
    imageUrl?: string;
  }>
> = ({ title, date, imageUrl, children }) => (
  <Card className="paper px-5 py-4 desktop:px-6 desktop:py-5 flex flex-col flex-wrap overflow-hidden leading-6">
    <header className="leading-6 font-bold">
      <h2 className="text-lg desktop:text-xl">{title}</h2>
      <span className="text-a3-orange font-normal">
        {dayjs(date).format('DD.MM.YYYY')}
      </span>
    </header>
    <View.Condition if={Boolean(imageUrl)}>
      <img
        className="mt-4 w-full max-h-48 desktop:max-h-64 object-cover object-center rounded-sm"
        src={imageUrl!}
        alt="post image"
      />
    </View.Condition>
    <main className="mt-4 desktop:mt-5 text-sm desktop:text-base [&_a]:text-orange-400 [&_a:hover]:underline [&_ul]:list-[circle] [&_ul]:pl-[30px] [&_ul]:text-orange-400">
      {children}
    </main>
  </Card>
);

export { Post };
