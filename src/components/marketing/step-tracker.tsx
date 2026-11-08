import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StepTrackerItem {
  title: string;
  description: ReactNode;
}

export interface StepTrackerProps {
  steps: StepTrackerItem[];
  className?: string;
}

/**
 * The site's recurring "step-tracker" device (the reference brand
 * language calls this pattern out by name) — a numbered, connected
 * vertical sequence. Used here for narrative process steps; see
 * FlowGenerationShowcase for the same visual idea applied to an actual
 * flow's steps.
 */
export function StepTracker({ steps, className }: StepTrackerProps) {
  return (
    <ol className={cn(className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-5 pb-10 last:pb-0">
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="bg-border absolute top-11 left-[19px] h-[calc(100%-2.75rem)] w-px"
            />
          ) : null}
          <span className="bg-brand font-display text-brand-foreground relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {index + 1}
          </span>
          <div className="pt-1.5">
            <h3 className="font-display text-foreground text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-1.5">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
