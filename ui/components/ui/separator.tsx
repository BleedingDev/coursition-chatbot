import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Separator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('shrink-0 bg-slate-200', className)}
    ref={ref}
    {...props}
  />
));
Separator.displayName = 'Separator';

export { Separator };
