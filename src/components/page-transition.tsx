'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { softTransition } from '@/lib/motion';

export interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wraps route content in a soft fade+rise on every navigation — keyed
 * on `pathname` so `AnimatePresence` treats each route as a distinct
 * element and animates the swap. Deliberately subtle (8px of travel,
 * the shared `softTransition` curve) rather than a slide/wipe — a
 * heavier transition reads as decoration getting in the way on a
 * data-dense dashboard, which is most of this app.
 *
 * Checks `useReducedMotion()` explicitly — this is the single most
 * frequently-triggered animation in the entire app (every navigation,
 * not just a loading state), so it's exactly the one place a missed
 * reduced-motion check would be most noticeable and most disruptive to
 * someone who has it turned on for a real reason.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={softTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
