import { FC, PropsWithChildren } from 'react';

const Preloader: FC<
  PropsWithChildren<{
    className?: string;
    isLoading: boolean;
  }>
> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <div className="mx-auto flex justify-center items-center w-full h-[250px]">
        <div className="inline-block relative w-20 h-20 box-border">
          <div className="box-border block absolute w-[55px] h-[55px] m-2 border-8 border-white rounded-full animate-lds-ring border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.45s]" />
          <div className="box-border block absolute w-[55px] h-[55px] m-2 border-8 border-white rounded-full animate-lds-ring border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.3s]" />
          <div className="box-border block absolute w-[55px] h-[55px] m-2 border-8 border-white rounded-full animate-lds-ring border-t-transparent border-r-transparent border-b-transparent [animation-delay:-0.15s]" />
          <div className="box-border block absolute w-[55px] h-[55px] m-2 border-8 border-white rounded-full animate-lds-ring border-t-transparent border-r-transparent border-b-transparent" />
        </div>
      </div>
    );
  }

  return children;
};

export { Preloader };
