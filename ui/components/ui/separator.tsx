import { cn } from '@/lib/utils';

const Separator = ({
  className,
  orientation = 'horizontal',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
}) => (
  <div
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className
    )}
    {...props}
  />
);
Separator.displayName = 'Separator';

export { Separator };
