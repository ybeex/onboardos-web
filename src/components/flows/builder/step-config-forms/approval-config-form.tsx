import { Field } from '@/components/ui/input';
import { NextStepSelect } from '@/components/flows/builder/step-config-forms/next-step-select';
import type { ApprovalStepConfig } from '@/types/flow';
import type { StepOption } from '@/components/flows/builder/step-config-forms/next-step-select';

export interface ApprovalConfigFormProps {
  config: ApprovalStepConfig;
  onChange: (config: ApprovalStepConfig) => void;
  otherSteps: StepOption[];
}

/** The step's own `nextStepId` (edited in StepEditorCard, not here) is the APPROVED path — this form only covers the rejected path (Section 4). */
export function ApprovalConfigForm({ config, onChange, otherSteps }: ApprovalConfigFormProps) {
  return (
    <Field label="If rejected, go to" htmlFor="approval-reject">
      {({ id }) => (
        <NextStepSelect
          id={id}
          value={config.onRejectStepId}
          onChange={(value) => {
            onChange({ ...config, onRejectStepId: value });
          }}
          options={otherSteps}
          nullLabel="None"
        />
      )}
    </Field>
  );
}
