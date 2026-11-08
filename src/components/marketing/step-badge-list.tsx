import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { ModuleStepExample } from '@/lib/marketing/modules';
import { fadeInUp, staggerContainer } from '@/lib/motion';

/** Illustrative-only badge colors for marketing content — not the canonical step-type styling the real flow builder (Milestone 6) will use. */
const STEP_BADGE_VARIANT: Record<string, NonNullable<BadgeProps['variant']>> = {
  Content: 'info',
  Form: 'brand',
  Task: 'neutral',
  Approval: 'warning',
  Verification: 'success',
  Esign: 'info',
};

export interface StepBadgeListProps {
  steps: ModuleStepExample[];
  /** Plays a staggered reveal via Motion when true; renders as plain static markup when false (reduced motion, or a page where the list doesn't need to animate). */
  animated?: boolean;
}

/**
 * A numbered, connected step list with a type badge per row — the same
 * visual device as StepTracker, applied to actual flow steps rather
 * than narrative process steps. Shared between FlowGenerationShowcase
 * and the module detail pages so a module's `exampleSteps` render
 * identically everywhere they appear.
 */
export function StepBadgeList({ steps, animated = false }: StepBadgeListProps) {
  const ListComponent = animated ? motion.ol : 'ol';
  const ItemComponent = animated ? motion.li : 'li';

  return (
    <ListComponent
      {...(animated ? { variants: staggerContainer, initial: 'hidden', animate: 'visible' } : {})}
      className="space-y-0"
    >
      {steps.map((step, index) => (
        <ItemComponent
          key={step.title}
          {...(animated ? { variants: fadeInUp } : {})}
          className="relative flex gap-3 pb-4 last:pb-0"
        >
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="bg-border absolute top-6 left-[11px] h-full w-px" />
          ) : null}
          <span className="bg-brand text-brand-foreground relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {index + 1}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
            <Badge variant={STEP_BADGE_VARIANT[step.stepType] ?? 'neutral'}>{step.stepType}</Badge>
            <span className="text-foreground text-sm font-medium">{step.title}</span>
          </div>
        </ItemComponent>
      ))}
    </ListComponent>
  );
}
