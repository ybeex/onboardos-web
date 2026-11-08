import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * A styled native `<select>`, deliberately not a custom-built listbox —
 * the native element gives correct keyboard navigation, screen-reader
 * behavior, and mobile OS picker UI for free, none of which a from-scratch
 * implementation would match without significantly more code. Styled to
 * visually match Input/Textarea via the same token classes.
 */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'border-input bg-background text-foreground ease-soft h-10 w-full appearance-none rounded-md border px-3.5 pr-10 text-sm transition-colors duration-150',
          'focus-visible:border-ring focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
      />
    </div>
  );
}
