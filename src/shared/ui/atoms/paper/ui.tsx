import { cva, type VariantProps } from 'class-variance-authority';
import { createElement, type HTMLAttributes, type Ref } from 'react';

import { cn } from '@/shared/utils/cn';

/**
 * Translucent content surface used across content pages (profile, changelog, licence, auth…).
 *
 * - `glass`  – main surface: semi-transparent dark with backdrop blur.
 * - `solid`  – more opaque, for content that must stay readable over busy backgrounds.
 * - `subtle` – for blocks nested inside another Paper (no extra blur).
 */
const paperVariants = cva('relative text-white border', {
  variants: {
    variant: {
      glass:
        'bg-[rgba(7,11,10,0.55)] border-white/15 backdrop-blur-md backdrop-saturate-[1.2] shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
      solid:
        'bg-[rgba(7,11,10,0.85)] border-white/15 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
      subtle: 'bg-white/[0.04] border-white/10',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4 desktop:p-5',
      lg: 'p-5 desktop:p-8',
    },
  },
  defaultVariants: {
    variant: 'glass',
    padding: 'md',
  },
});

type PaperElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'form' | 'nav' | 'header';

type PaperProps = Omit<HTMLAttributes<HTMLElement>, 'onSubmit'> &
  VariantProps<typeof paperVariants> & {
    as?: PaperElement;
    ref?: Ref<HTMLElement>;
    /** Passed through when `as="form"`. */
    onSubmit?: HTMLAttributes<HTMLFormElement>['onSubmit'];
    /** Passed through when `as="form"` — disables native browser validation. */
    noValidate?: boolean;
  };

const Paper = ({ as = 'div', variant, padding, className, ...props }: PaperProps) =>
  createElement(as, {
    className: cn(paperVariants({ variant, padding }), className),
    ...props,
  });

export { Paper, paperVariants };
export type { PaperProps };
