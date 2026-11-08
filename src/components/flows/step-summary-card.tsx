import { Badge } from '@/components/ui/badge';
import type { Step } from '@/types/flow';
import type { AiFlowDraftStep } from '@/types/flow-draft';
import { formatCondition } from '@/lib/flows/format-condition';
import { STEP_TYPE_ICON, STEP_TYPE_LABEL } from '@/lib/flows/step-type-display';

function resolveStepTitle(stepId: string | null, stepTitleById: Map<string, string>): string {
  if (!stepId) return 'End of flow';
  return stepTitleById.get(stepId) ?? 'Unknown step';
}

/**
 * A real `Step`'s base pointer is `nextStepId`; an `AiFlowDraftStep`'s
 * is `nextStepKey` (see `@/types/flow-draft`'s header comment for why).
 * Reading through this instead of `step.nextStepId` directly is what
 * lets this one component render both — M7's own plan explicitly calls
 * for reusing M6's step-list components in the draft preview rather
 * than building a second, parallel rendering system.
 */
function getNextPointer(step: Step | AiFlowDraftStep): string | null {
  return 'nextStepId' in step ? step.nextStepId : (step.nextStepKey ?? null);
}

/**
 * The base `nextStepId` means something different per step type —
 * APPROVAL and VERIFICATION both pair it with an `onRejectStepId`
 * sibling (Section 4 is explicit that APPROVAL's `nextStepId` is the
 * *approved* path; VERIFICATION follows the same paired shape, so the
 * same reading is applied there too, flagged as inferred-by-analogy
 * rather than separately confirmed). CONDITIONAL_BRANCH's own
 * `nextStepId` isn't documented at all — read here as "the fallback
 * when no branch condition matches," a reasonable but unconfirmed
 * inference; verify against the real backend source.
 */
function nextStepLabel(step: Step | AiFlowDraftStep): string {
  switch (step.type) {
    case 'APPROVAL':
      return 'If approved';
    case 'VERIFICATION':
      return 'If verified';
    case 'CONDITIONAL_BRANCH':
      return 'If no branch matches';
    default:
      return 'Then';
  }
}

export interface StepSummaryCardProps {
  step: Step | AiFlowDraftStep;
  index: number;
  /**
   * Resolves nextStepId/onRejectStepId/nextStepKey/branch targets into
   * readable titles rather than raw ids or keys. Keyed by real `id` for
   * a saved flow's steps (M5/M6 callers), or by `key` for an
   * unmaterialized AI draft's steps (M7's draft preview) — this
   * component doesn't care which, as long as the map and the step
   * data use the same reference scheme.
   */
  stepTitleById: Map<string, string>;
}

/**
 * M5's read-only rendering of a step — Section 5's own M5 note calls
 * for "StepType-specific summary cards." M6's builder introduced the
 * canonical, editable step-card system (`StepEditorCard`) for the
 * builder itself; this one remains the read-only rendering, reused
 * as-is (not forked) by M7's draft preview for an unmaterialized AI
 * draft's steps — see `getNextPointer` above for how it stays agnostic
 * to real-step-vs-draft-step without a second parallel component.
 */
export function StepSummaryCard({ step, index, stepTitleById }: StepSummaryCardProps) {
  const Icon = STEP_TYPE_ICON[step.type];

  return (
    <div className="border-border bg-card shadow-soft-sm flex gap-4 rounded-lg border p-5">
      <span className="bg-accent text-accent-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Icon aria-hidden="true" className="text-muted-foreground h-4 w-4 shrink-0" />
          <Badge variant="neutral">{STEP_TYPE_LABEL[step.type]}</Badge>
          <h3 className="font-display text-foreground text-base font-semibold">{step.title}</h3>
        </div>

        <div className="text-muted-foreground mt-3 text-sm">
          {step.type === 'CONTENT' && <p className="line-clamp-2">{step.config.body}</p>}
          {step.type === 'FORM' && (
            <p>
              {step.config.fields.length} field{step.config.fields.length === 1 ? '' : 's'}:{' '}
              {step.config.fields.map((field) => field.label).join(', ')}
            </p>
          )}
          {step.type === 'TASK' && (
            <p>
              {step.config.assigneeRole ? `Assigned to ${step.config.assigneeRole}` : 'Unassigned'}
              {step.config.instructions ? ` — ${step.config.instructions}` : ''}
            </p>
          )}
          {step.type === 'APPROVAL' && (
            <p>If rejected: {resolveStepTitle(step.config.onRejectStepId, stepTitleById)}</p>
          )}
          {step.type === 'VERIFICATION' && (
            <p>
              Provider: {step.config.provider} · If rejected:{' '}
              {resolveStepTitle(step.config.onRejectStepId, stepTitleById)}
            </p>
          )}
          {step.type === 'CONDITIONAL_BRANCH' && (
            <ul className="space-y-1">
              {step.config.branches.map((branch, branchIndex) => (
                <li key={branchIndex}>
                  If {formatCondition(branch.when)} →{' '}
                  {resolveStepTitle(branch.nextStepId, stepTitleById)}
                </li>
              ))}
            </ul>
          )}
          {step.type === 'ESIGN' && <p>E-signature collection</p>}
          {step.type === 'INTEGRATION_TRIGGER' && <p>Triggers an external integration</p>}
        </div>

        <p className="text-muted-foreground mt-3 text-xs">
          {nextStepLabel(step)}: {resolveStepTitle(getNextPointer(step), stepTitleById)}
        </p>
      </div>
    </div>
  );
}
