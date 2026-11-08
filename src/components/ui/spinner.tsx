'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Visually hidden accessible label for screen readers — required, not optional, since a spinner conveys no information without one. */
  label?: string;
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

/**
 * Same segmented-ring shape as LogoMark, purpose-built for continuous
 * rotation rather than reused directly from it — a spinner's ring wants
 * fewer, larger segments than the logo's so the rotation itself (not
 * the segment count) reads as the primary visual, and a `strokeDasharray`
 * tuned for perfectly even repetition (unlike the logo mark's, which is
 * tuned for how it looks static).
 */
export function Spinner({ className, size = 'md', label = 'Loading' }: SpinnerProps) {
  const prefersReducedMotion = useReducedMotion();

  const ring = (
    <circle
      cx="20"
      cy="20"
      r="15"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeDasharray="16 15.7"
      opacity="0.9"
    />
  );

  return (
    <span role="status" className={cn('inline-flex', SIZE_CLASSES[size], className)}>
      {prefersReducedMotion ? (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-current"
        >
          {ring}
        </svg>
      ) : (
        <motion.svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-current"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          {ring}
        </motion.svg>
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
}
