import { FC, ReactNode } from 'react';

const RING_CLASS =
  'box-border block absolute w-[55px] h-[55px] m-2 border-8 border-white rounded-full animate-lds-ring border-t-transparent border-r-transparent border-b-transparent';

/** Full-screen blocking loader: dims the page and shows a spinner with an optional label. */
const ScreenLoader: FC<{ isLoading: boolean; label?: ReactNode }> = ({ isLoading, label }) => {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[rgba(7,11,10,0.85)] backdrop-blur-[2px] animate-overlayShow"
    >
      <div className="relative inline-block w-20 h-20 box-border">
        <div className={`${RING_CLASS} [animation-delay:-0.45s]`} />
        <div className={`${RING_CLASS} [animation-delay:-0.3s]`} />
        <div className={`${RING_CLASS} [animation-delay:-0.15s]`} />
        <div className={RING_CLASS} />
      </div>

      {label && (
        <p className="px-4 text-[22px] text-center text-white uppercase font-medium">{label}…</p>
      )}
    </div>
  );
};

export { ScreenLoader };
