import { cn } from '@/lib/utils';

const Separator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('shrink-0 bg-slate-200', className)} {...props} />
);
Separator.displayName = 'Separator';

export { Separator };
