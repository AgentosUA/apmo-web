import { FC, SVGProps, useId } from 'react';

type FlagProps = SVGProps<SVGSVGElement>;

const FlagGB: FC<FlagProps> = (props) => {
  const id = useId();
  const clipFlag = `${id}-s`;
  const clipDiag = `${id}-t`;

  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" {...props}>
      <clipPath id={clipFlag}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={clipDiag}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipFlag})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath={`url(#${clipDiag})`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
};

const FlagCZ: FC<FlagProps> = (props) => (
  <svg viewBox="0 0 900 600" {...props}>
    <rect width="900" height="600" fill="#D7141A" />
    <rect width="900" height="300" fill="#fff" />
    <path d="M0,0 450,300 0,600z" fill="#11457E" />
  </svg>
);

const FlagUA: FC<FlagProps> = (props) => (
  <svg viewBox="0 0 3 2" {...props}>
    <rect width="3" height="2" fill="#FFD700" />
    <rect width="3" height="1" fill="#0057B7" />
  </svg>
);

export { FlagGB, FlagCZ, FlagUA };
