import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-800 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-indigo-800 text-white hover:bg-indigo-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline:
          'border border-slate-400 bg-white hover:bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100',
        secondary:
          'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-700',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
        link: 'text-indigo-900 dark:text-indigo-300 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
