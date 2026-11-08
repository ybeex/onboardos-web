'use client';

import { useState } from 'react';
import { ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { StepSummaryCard } from '@/components/flows/step-summary-card';
import { Badge } from '@/components/ui/badge';
import { Field, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AiFlowDraft } from '@/types/flow-draft';

export interface DraftPreviewProps {
  draft: AiFlowDraft;
  repaired: boolean;
  isRefining: boolean;
  isMaterializing: boolean;
  onRefine: (instruction: string) => void;
  onMaterialize: () => void;
}

/**
 * Reuses `StepSummaryCard` in read mode rather than a second,
 * parallel step-rendering system (M7's own plan is explicit about
 * this) — the lookup map here is keyed by each step's `key`, not a
 * real `id`, since nothing is persisted until materialize. See
 * `@/types/flow-draft`'s header comment for the full reasoning.
 */
export function DraftPreview({
  draft,
  repaired,
  isRefining,
  isMaterializing,
  onRefine,
  onMaterialize,
}: DraftPreviewProps) {
  const [refinementInstruction, setRefinementInstruction] = useState('');

  const sortedSteps = [...draft.steps].sort((a, b) => a.position - b.position);
  const stepTitleByKey = new Map(draft.steps.map((step) => [step.key, step.title]));
  const entryStepTitle = stepTitleByKey.get(draft.entryStepKey) ?? 'Unknown step';

  const busy = isRefining || isMaterializing;

  return (
    <div className="space-y-6">
      <div className="border-border bg-card shadow-soft-sm rounded-lg border p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-foreground text-xl font-bold">{draft.name}</h2>
          {repaired ? (
            <span
              className="inline-flex"
              title="The first draft needed one automatic fix-up pass before it validated — double-checked, not a cause for concern."
            >
              <Badge variant="info">
                <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                Double-checked
              </Badge>
            </span>
          ) : null}
        </div>
        {draft.description ? (
          <p className="text-muted-foreground mt-2 text-sm">{draft.description}</p>
        ) : null}
        <p className="text-muted-foreground mt-3 text-xs">
          Entry step: <span className="text-foreground font-medium">{entryStepTitle}</span>
        </p>
      </div>

      <div className="space-y-3">
        {sortedSteps.map((step, index) => (
          <StepSummaryCard
            key={step.key}
            step={step}
            index={index}
            stepTitleById={stepTitleByKey}
          />
        ))}
      </div>

      <div className="border-border bg-card shadow-soft-sm rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <Wand2 aria-hidden="true" className="text-brand h-4 w-4" />
          <h3 className="font-display text-foreground text-sm font-semibold">
            Want something different?
          </h3>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Describe what to change and we&rsquo;ll regenerate the whole draft — nothing is saved yet,
          so there&rsquo;s nothing to lose by iterating.
        </p>
        <div className="mt-3">
          <Field label="Refinement" htmlFor="refine-instruction">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={refinementInstruction}
                onChange={(event) => {
                  setRefinementInstruction(event.target.value);
                }}
                rows={3}
                disabled={busy}
                placeholder="e.g. “Add a background check step before the manager approval.”"
              />
            )}
          </Field>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          isLoading={isRefining}
          disabled={busy || refinementInstruction.trim().length === 0}
          onClick={() => {
            onRefine(refinementInstruction.trim());
            setRefinementInstruction('');
          }}
        >
          Refine draft
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          isLoading={isMaterializing}
          disabled={busy}
          leadingIcon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
          onClick={onMaterialize}
        >
          Use this flow
        </Button>
      </div>
    </div>
  );
}
