import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { NextStepSelect } from '@/components/flows/builder/step-config-forms/next-step-select';
import type { StepOption } from '@/components/flows/builder/step-config-forms/next-step-select';
import type { VerificationStepConfig } from '@/types/flow';
import { VERIFICATION_PROVIDER_VALUES } from '@/types/enums';

export interface VerificationConfigFormProps {
  config: VerificationStepConfig;
  onChange: (config: VerificationStepConfig) => void;
  otherSteps: StepOption[];
}

/** The step's own `nextStepId` (edited in StepEditorCard, not here) is read as the verified/passed path, by analogy with APPROVAL's documented shape — see types/flow.ts's own comment on that inference. This form covers the rejected path. */
export function VerificationConfigForm({
  config,
  onChange,
  otherSteps,
}: VerificationConfigFormProps) {
  return (
    <div className="space-y-4">
      <Field label="Provider" htmlFor="verification-provider" required>
        {({ id }) => (
          <Select
            id={id}
            value={config.provider}
            onChange={(event) => {
              onChange({
                ...config,
                provider: event.target.value as VerificationStepConfig['provider'],
              });
            }}
          >
            {VERIFICATION_PROVIDER_VALUES.map((provider) => (
              <option key={provider} value={provider}>
                {provider.charAt(0) + provider.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Provider template ID" htmlFor="verification-template" hint="Optional">
        {({ id }) => (
          <Input
            id={id}
            value={config.providerTemplateId ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                onChange({ ...config, providerTemplateId: value });
              } else {
                const { providerTemplateId: _providerTemplateId, ...rest } = config;
                onChange(rest);
              }
            }}
          />
        )}
      </Field>

      <Field label="If rejected, go to" htmlFor="verification-reject">
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
    </div>
  );
}
