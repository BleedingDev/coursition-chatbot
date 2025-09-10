import { cva, type VariantProps } from 'class-variance-authority';
import { Slot as SlotPrimitive } from 'radix-ui';
import type * as React from 'react';
import { twJoin } from 'tailwind-merge';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      colorScheme: {
        primary:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        secondary:
          'bg-gray-600 text-white shadow-sm hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700',
        success:
          'bg-green-600 text-white shadow-sm hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700',
        warning:
          'bg-yellow-600 text-white shadow-sm hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700',
        danger:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        info: 'bg-cyan-600 text-white shadow-sm hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700',
        purple:
          'bg-purple-600 text-white shadow-sm hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700',
        indigo:
          'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700',
        pink: 'bg-pink-600 text-white shadow-sm hover:bg-pink-700 dark:bg-pink-600 dark:hover:bg-pink-700',
        orange:
          'bg-orange-600 text-white shadow-sm hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700',
        teal: 'bg-teal-600 text-white shadow-sm hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
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

const Button = ({
  className,
  variant,
  colorScheme,
  size,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : 'button';
  return (
    <Comp
      className={twJoin(
        cn(buttonVariants({ variant, colorScheme, size, className })),
        'cursor-pointer'
      )}
      {...props}
    />
  );
};
Button.displayName = 'Button';

export { Button, buttonVariants };
