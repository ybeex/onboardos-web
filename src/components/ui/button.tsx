import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

/**
 * Pill-shaped (`rounded-full`) by default — a deliberate match to the
 * reference brand language's CTA pattern ("Submit my request," "Start
 * Standard Request"), not Tailwind's own tighter default radius.
 * Exported standalone so a `<Link>`-based CTA can apply the identical
 * classes without needing a Slot/asChild dependency for the common
 * "this needs to navigate, not submit a form" case.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors duration-150 ease-soft disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        outline: 'border border-input bg-transparent text-foreground hover:bg-muted',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'rounded-none bg-transparent p-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Swaps the button's content for a spinner and disables interaction — used for every async action (form submits, AI generation triggers, step completion). */
  isLoading?: boolean;
  /** Icon or element shown before the label, hidden while `isLoading` (the spinner takes its place). */
  leadingIcon?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  leadingIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label="" className="text-current" /> : leadingIcon}
      {children}
    </button>
  );
}
