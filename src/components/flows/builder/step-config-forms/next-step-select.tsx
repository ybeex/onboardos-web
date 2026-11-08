import { Select } from '@/components/ui/select';

export interface StepOption {
  id: string;
  title: string;
}

export interface NextStepSelectProps {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: StepOption[];
  /** Label for the null value — differs by context ("End of flow" for a linear next, "None" for a reject target). */
  nullLabel: string;
}

/** Shared by every config form needing to reference another step in the same flow (APPROVAL/VERIFICATION's onRejectStepId, CONDITIONAL_BRANCH's per-branch nextStepId). */
export function NextStepSelect({ id, value, onChange, options, nullLabel }: NextStepSelectProps) {
  return (
    <Select
      id={id}
      value={value ?? ''}
      onChange={(event) => {
        onChange(event.target.value || null);
      }}
    >
      <option value="">{nullLabel}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.title}
        </option>
      ))}
    </Select>
  );
}
