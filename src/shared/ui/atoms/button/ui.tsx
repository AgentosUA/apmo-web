import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  "min-w-[127px] w-max-lg:pl-2.5 pl-1.5 pr-1 text-white text-sm font-[var(--font-roboto)] font-normal border-none cursor-pointer uppercase bg-black focus-visible:outline-none focus-visible:border-none",
  {
    variants: {
      variant: {
        default: 'h-5 text-left hover:text-black hover:animate-white-blink w-max-lg:h-10',
        primary: 'min-w-auto py-1 hover:animate-none hover:bg-a3-orange px-4',
        thin: 'h-auto text-left hover:text-black hover:animate-white-blink',
        transparent: 'h-8 text-center bg-transparent hover:bg-black hover:text-white hover:animate-none',
        destructive: 'bg-[#9F0F0F] hover:text-black hover:animate-white-blink w-max-lg:h-10',
        orange: 'h-8 text-center bg-a3-orange hover:bg-a3-orange/80',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
        'icon-sm': '',
        'icon-lg': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
