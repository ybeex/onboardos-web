import { Check, Loader2, Clock, X, Circle } from 'lucide-react';
import { StepActionPanel } from '@/components/enrollments/step-action-panel';
import { STEP_TYPE_ICON } from '@/lib/flows/step-type-display';
import { cn } from '@/lib/utils';
import type { Step } from '@/types/flow';
import type { StepExecution } from '@/types/enrollment';
import type { StepExecutionStatus } from '@/types/enums';

export interface StepExecutionTimelineProps {
  executions: StepExecution[];
  /** Null when no flow context is available at all (see `@/types/enrollment`'s header comment) — every row then falls back to its raw stepId. */
  stepById: Map<string, Step> | null;
  completingExecutionId: string | null;
  onCompleteStep: (execution: StepExecution, output: Record<string, unknown>) => void;
}

const DOT_STYLES: Record<StepExecutionStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-info/10 text-info',
  WAITING: 'bg-warning/10 text-warning',
  COMPLETED: 'bg-success/10 text-success',
  FAILED: 'bg-destructive/10 text-destructive',
};

function StatusDot({
  status,
  fallbackIcon: FallbackIcon,
}: {
  status: StepExecutionStatus;
  fallbackIcon: typeof Circle;
}) {
  const Icon =
    status === 'COMPLETED'
      ? Check
      : status === 'FAILED'
        ? X
        : status === 'ACTIVE'
          ? Loader2
          : status === 'WAITING'
            ? Clock
            : FallbackIcon;
  return (
    <span
      className={cn(
        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        DOT_STYLES[status],
      )}
    >
      <Icon aria-hidden="true" className={cn('h-4 w-4', status === 'ACTIVE' && 'animate-spin')} />
    </span>
  );
}

function OutputSummary({ output }: { output: Record<string, unknown> }) {
  const entries = Object.entries(output).filter(([, value]) => value !== undefined && value !== '');
  if (entries.length === 0) return null;
  return (
    <dl className="border-border bg-muted/40 mt-2 space-y-1 rounded-md border px-3 py-2 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{key}</dt>
          <dd className="text-foreground text-right break-all">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The step-execution timeline, in real execution order (the API already
 * returns `stepExecutions` ordered by `createdAt` ascending). A
 * continuous rail connects every dot; the dot's icon and color read the
 * StepExecution's own status, independent of whether the step's title/
 * type could be resolved (see `stepById`'s doc comment on this prop).
 */
export function StepExecutionTimeline({
  executions,
  stepById,
  completingExecutionId,
  onCompleteStep,
}: StepExecutionTimelineProps) {
  // Not known to happen in the normal "start an enrollment" path (the
  // backend seeds the first execution atomically), but the type is
  // StepExecution[], not a non-empty variant, and nothing upstream
  // guards against it — enrollment-detail-view.tsx passes stepExecutions
  // straight through. Without this, an empty array rendered a bare,
  // unexplained <ol> here: exactly the "blank area, not a real empty
  // state" failure this M10 audit pass exists to catch.
  if (executions.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">This enrollment has no step history yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative">
      {executions.map((execution, index) => {
        const step = stepById?.get(execution.stepId) ?? null;
        const FallbackIcon = step ? STEP_TYPE_ICON[step.type] : Circle;
        const isLast = index === executions.length - 1;

        return (
          <li key={execution.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                className="bg-border absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-px"
                aria-hidden="true"
              />
            ) : null}
            <StatusDot status={execution.status} fallbackIcon={FallbackIcon} />
            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-foreground text-sm font-semibold">
                  {step ? step.title : `Step ${execution.stepId.slice(-6)}`}
                </h3>
                {step ? (
                  <span className="text-muted-foreground text-xs">
                    {step.type.charAt(0) + step.type.slice(1).toLowerCase().replace('_', ' ')}
                  </span>
                ) : null}
              </div>

              {execution.status === 'FAILED' && execution.failureReason ? (
                <p className="text-destructive mt-1 text-sm">{execution.failureReason}</p>
              ) : null}

              {execution.status === 'WAITING' ? (
                <div className="mt-3">
                  <StepActionPanel
                    step={step}
                    execution={execution}
                    isSubmitting={completingExecutionId === execution.id}
                    onComplete={(output) => {
                      onCompleteStep(execution, output);
                    }}
                  />
                </div>
              ) : null}

              {execution.status === 'COMPLETED' && execution.output ? (
                <OutputSummary output={execution.output} />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
