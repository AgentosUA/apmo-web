import { HTMLAttributes, forwardRef } from 'react';

const RadixChildren = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div {...props} ref={ref}>
    {children}
  </div>
));

RadixChildren.displayName = 'RadixChildren';

export { RadixChildren };
