'use client';

import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC } from 'react';

import { Toaster as ToasterType, toasterEntity } from './model';

const Toaster: FC<{
  model?: ToasterType;
}> = observer(({ model }) => {
  const entity = model ?? toasterEntity;

  return (
    <div className="fixed top-[250px] left-1/2 gap-0.5 w-[270px] z-[1001] -translate-x-1/2 text-white overflow-hidden flex flex-col items-center justify-center">
      {entity.toasters.map((toaster, index) => (
        <div
          key={toaster.id}
          className="gap-0.5 w-[270px] z-[1001] text-white overflow-hidden flex flex-col items-center justify-center"
          data-duration={toaster.timer}
          style={{
            zIndex: 1000 + index,
          }}
        >
          <div
            className="flex items-center text-left min-h-5 py-1 px-[7px] w-full text-sm text-center uppercase bg-black/80 animate-show-title overflow-hidden"
            data-duration={toaster.timer}
          >
            {toaster.title}
          </div>
          <div
            className="flex items-center justify-between w-full gap-0.5 text-xs h-auto max-h-0 animate-show-content overflow-hidden"
            data-duration={toaster.timer}
          >
            <div className="h-8 w-8 shrink-0 bg-black/80">
              <Image
                src="/icons/radio.png"
                width={32}
                height={32}
                alt="radio"
              />
            </div>
            <div className="flex justify-center items-center text-left w-full text-sm px-1 leading-tight min-h-8 text-center text-ellipsis overflow-hidden bg-black/80">
              {toaster.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export { Toaster };
