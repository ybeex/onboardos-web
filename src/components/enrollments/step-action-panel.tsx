import { FormStepAction } from '@/components/enrollments/step-actions/form-step-action';
import { TaskStepAction } from '@/components/enrollments/step-actions/task-step-action';
import { ContentStepAction } from '@/components/enrollments/step-actions/content-step-action';
import { ApprovalStepAction } from '@/components/enrollments/step-actions/approval-step-action';
import { VerificationStepAction } from '@/components/enrollments/step-actions/verification-step-action';
import type { Step } from '@/types/flow';
import type { StepExecution } from '@/types/enrollment';

export interface StepActionPanelProps {
  /** Null when this step's definition can't be resolved — see `@/types/enrollment`'s header comment for the two real reasons that happens. */
  step: Step | null;
  execution: StepExecution;
  isSubmitting: boolean;
  onComplete: (output: Record<string, unknown>) => void;
}

/**
 * Only meaningful for a WAITING execution — callers should not render
 * this otherwise. Dispatches on the resolved Step's type; ESIGN,
 * INTEGRATION_TRIGGER, and CONDITIONAL_BRANCH are a deliberate scope
 * boundary (see each branch below), not a silent gap.
 */
export function StepActionPanel({
  step,
  execution,
  isSubmitting,
  onComplete,
}: StepActionPanelProps) {
  if (!step) {
    return (
      <p className="text-muted-foreground text-sm">
        This step&rsquo;s details aren&rsquo;t available — the flow has changed since this
        enrollment started, so it can&rsquo;t be completed from this screen.
      </p>
    );
  }

  switch (step.type) {
    case 'FORM':
      return (
        <FormStepAction config={step.config} isSubmitting={isSubmitting} onSubmit={onComplete} />
      );
    case 'TASK':
      return (
        <TaskStepAction config={step.config} isSubmitting={isSubmitting} onSubmit={onComplete} />
      );
    case 'CONTENT':
      return (
        <ContentStepAction config={step.config} isSubmitting={isSubmitting} onSubmit={onComplete} />
      );
    case 'APPROVAL':
      return <ApprovalStepAction isSubmitting={isSubmitting} onSubmit={onComplete} />;
    case 'VERIFICATION':
      return <VerificationStepAction stepExecutionId={execution.id} config={step.config} />;
    case 'ESIGN':
    case 'INTEGRATION_TRIGGER':
      return (
        <p className="text-muted-foreground text-sm">
          Waiting on an external integration — not yet completable from this screen. A future
          integration callback resolves this step automatically.
        </p>
      );
    case 'CONDITIONAL_BRANCH':
      // Always auto-advance on the backend (isAutoAdvance) — should never
      // actually reach WAITING. Defensive, not a real path.
      return null;
  }
}
