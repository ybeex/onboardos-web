'use client';

import { motion, useReducedMotion } from 'motion/react';
import { LogoMark } from '@/components/ui/logo-mark';

export interface BrandedLoadingScreenProps {
  /** Optional short status text under the mark, e.g. "Loading your dashboard" — omit for a bare, generic loading state. */
  message?: string;
}

/**
 * A full-page loading state, distinct from the inline `<Spinner />` —
 * used for route-level Suspense boundaries (`app/loading.tsx` files)
 * where the wait is typically longer and a calmer, breathing-pulse
 * animation reads better than a spinning indicator. Respects
 * prefers-reduced-motion by holding the mark static instead of pulsing.
 */
export function BrandedLoadingScreen({ message }: BrandedLoadingScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  const mark = <LogoMark className="text-brand h-10 w-10" decorative={false} />;

  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4"
      role="status"
    >
      {prefersReducedMotion ? (
        mark
      ) : (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {mark}
        </motion.div>
      )}
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
