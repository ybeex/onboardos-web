import type { Transition, Variants } from 'motion/react';

/**
 * Mirrors globals.css's `--ease-soft-value` (cubic-bezier(0.16, 1, 0.3, 1))
 * and `--duration-*` tokens. Motion's `transition.ease` needs an actual
 * cubic-bezier control-point array, not a CSS `var()` reference, so this
 * is a deliberate, manually-kept-in-sync JS mirror of the CSS token —
 * both are "the design token," just expressed in the two different
 * value shapes each system requires. If the curve ever changes, update
 * both places.
 */
export const EASE_SOFT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DURATION_FAST = 0.15;
export const DURATION_NORMAL = 0.25;
export const DURATION_SLOW = 0.4;

export const softTransition: Transition = {
  duration: DURATION_NORMAL,
  ease: EASE_SOFT,
};

export const softTransitionFast: Transition = {
  duration: DURATION_FAST,
  ease: EASE_SOFT,
};

export const softTransitionSlow: Transition = {
  duration: DURATION_SLOW,
  ease: EASE_SOFT,
};

/** A small, subtle rise-and-fade — the default entrance for cards, list items, and most on-scroll or on-mount reveals across the app. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: softTransition },
};

/** Plain fade, no movement — used where a directional entrance would feel gratuitous (e.g. a backdrop, a skeleton-to-content swap). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: softTransition },
};

/** A gentle scale-and-fade, for modals/popovers/dropdowns — deliberately subtle (0.97 -> 1), never a bouncy spring. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: softTransitionFast },
};

/** Stagger-children helper — wrap a list container with this and each direct motion child with `fadeInUp` for a soft cascading reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};
