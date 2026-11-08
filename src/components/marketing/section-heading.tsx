import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  className?: string;
  /** Short label above the heading (e.g. "Modules", "How it works") — states what kind of section this is, not a decorative flourish. Omit when the heading alone is already self-evident. */
  eyebrow?: string;
  heading: ReactNode;
  description?: ReactNode;
  /** Center-aligns for a standalone section intro; left-aligned (default) reads better once a section's content itself is left-aligned (a feature list, a form). */
  align?: 'left' | 'center';
}

export function SectionHeading({
  className,
  eyebrow,
  heading,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className="font-display text-brand mb-3 text-sm font-semibold tracking-widest uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {heading}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 text-lg text-balance">{description}</p>
      ) : null}
    </div>
  );
}
