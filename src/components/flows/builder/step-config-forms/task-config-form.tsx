import { Field, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { TaskStepConfig } from '@/types/flow';

export interface TaskConfigFormProps {
  config: TaskStepConfig;
  onChange: (config: TaskStepConfig) => void;
}

const ASSIGNEE_ROLES: NonNullable<TaskStepConfig['assigneeRole']>[] = [
  'MANAGER',
  'BUDDY',
  'IT',
  'HR',
  'OWNER',
  'ADMIN',
];

export function TaskConfigForm({ config, onChange }: TaskConfigFormProps) {
  return (
    <div className="space-y-4">
      <Field label="Assignee" htmlFor="task-assignee" hint="Optional">
        {({ id }) => (
          <Select
            id={id}
            value={config.assigneeRole ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              const { assigneeRole: _assigneeRole, ...rest } = config;
              onChange(
                value
                  ? { ...rest, assigneeRole: value as NonNullable<TaskStepConfig['assigneeRole']> }
                  : rest,
              );
            }}
          >
            <option value="">Unassigned</option>
            {ASSIGNEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Instructions" htmlFor="task-instructions" hint="Optional">
        {({ id }) => (
          <Textarea
            id={id}
            rows={3}
            value={config.instructions ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                onChange({ ...config, instructions: value });
              } else {
                const { instructions: _instructions, ...rest } = config;
                onChange(rest);
              }
            }}
          />
        )}
      </Field>
    </div>
  );
}
