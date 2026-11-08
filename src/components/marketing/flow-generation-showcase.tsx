'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoMark } from '@/components/ui/logo-mark';
import { StepBadgeList } from '@/components/marketing/step-badge-list';
import { getModuleBySlug } from '@/lib/marketing/modules';

const EMPLOYEE_MODULE = getModuleBySlug('employee');
const EXAMPLE_STEPS = EMPLOYEE_MODULE?.exampleSteps ?? [];

const DESCRIPTION =
  'Onboard a new software engineer: send a welcome message, collect emergency contact details, provision their laptop and IT accounts, then route to their manager for a 30-day check-in approval.';

type Phase = 'generating' | 'complete';

/** How long the "generating" state holds before the result appears. */
const GENERATING_DURATION_MS = 1400;

/**
 * The hero's signature element (see BUILD_PLAN.md M2: "the AI
 * flow-generation feature needs to be a first-class marketing moment").
 * Plays once when scrolled into view: a plain-English description, a
 * brief "generating" state, then the resulting step sequence — a small,
 * honest illustration of the real `POST /flow-drafts` -> poll ->
 * materialize lifecycle (Section 4), not a simulated live API call.
 *
 * Reuses the Employee module's own `exampleSteps` (src/lib/marketing/
 * modules.ts) rather than separate copy, so this demo and the Employee
 * module page never drift apart on what they claim the product does.
 */
export function FlowGenerationShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('generating');
  const hasPlayedRef = useRef(false);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
    };
  }, []);

  function playSequence(): void {
    timeoutIdsRef.current.forEach(clearTimeout);
    setPhase('generating');
    timeoutIdsRef.current = [
      setTimeout(() => {
        setPhase('complete');
      }, GENERATING_DURATION_MS),
    ];
  }

  function handleViewportEnter(): void {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playSequence();
  }

  const chrome = (
    <div className="border-border bg-muted/60 flex items-center gap-2 border-b px-4 py-3">
      <div aria-hidden="true" className="flex gap-1.5">
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
        <span className="bg-border h-2.5 w-2.5 rounded-full" />
      </div>
      <LogoMark className="text-brand ml-2 h-4 w-4" />
      <span className="font-display text-muted-foreground text-xs font-semibold">
        AI Flow Generator
      </span>
      <Badge variant="brand" className="ml-auto">
        Employee module
      </Badge>
    </div>
  );

  const description = (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Describe the onboarding you want
      </p>
      <div className="border-input bg-background text-foreground mt-2 rounded-md border px-3.5 py-3 text-sm">
        {DESCRIPTION}
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return (
      <div className="border-border bg-card shadow-soft-lg overflow-hidden rounded-xl border">
        {chrome}
        <div className="p-5 sm:p-6">
          {description}
          <div className="mt-5">
            <StepBadgeList steps={EXAMPLE_STEPS} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      onViewportEnter={handleViewportEnter}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-border bg-card shadow-soft-lg overflow-hidden rounded-xl border"
    >
      {chrome}
      <div className="p-5 sm:p-6">
        {description}
        <div className="mt-5 min-h-[172px]">
          {phase === 'generating' ? (
            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner size="sm" label="" />
                Generating your flow…
              </div>
              <div className="mt-4 space-y-2" aria-hidden="true">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-5/6" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <div>
              <StepBadgeList steps={EXAMPLE_STEPS} animated />
              <button
                type="button"
                onClick={playSequence}
                className="text-brand ease-soft hover:text-brand/80 mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
