import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * A subtle breathing-opacity pulse, not a shimmer sweep — consistent
 * with the app's "soft, not attention-grabbing" animation philosophy.
 * Respects prefers-reduced-motion automatically via Tailwind's built-in
 * `animate-pulse` utility, which itself is disabled by the
 * reduced-motion rule in globals.css's base layer.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
