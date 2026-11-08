import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { FormField, FormStepConfig } from '@/types/flow';

export interface FormConfigFormProps {
  config: FormStepConfig;
  onChange: (config: FormStepConfig) => void;
}

const FIELD_TYPES: FormField['type'][] = ['TEXT', 'SELECT', 'CHECKBOX', 'DATE'];

function emptyField(): FormField {
  return { key: '', label: '', type: 'TEXT' };
}

function updateFieldAt(fields: FormField[], index: number, patch: Partial<FormField>): FormField[] {
  return fields.map((field, i) => (i === index ? { ...field, ...patch } : field));
}

export function FormConfigForm({ config, onChange }: FormConfigFormProps) {
  return (
    <div className="space-y-3">
      {config.fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">No fields yet.</p>
      ) : (
        config.fields.map((field, index) => (
          <div key={index} className="border-border space-y-2 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Field key"
                value={field.key}
                onChange={(event) => {
                  onChange({
                    ...config,
                    fields: updateFieldAt(config.fields, index, { key: event.target.value }),
                  });
                }}
              />
              <Input
                placeholder="Label"
                value={field.label}
                onChange={(event) => {
                  onChange({
                    ...config,
                    fields: updateFieldAt(config.fields, index, { label: event.target.value }),
                  });
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={field.type}
                onChange={(event) => {
                  onChange({
                    ...config,
                    fields: updateFieldAt(config.fields, index, {
                      type: event.target.value as FormField['type'],
                    }),
                  });
                }}
                className="w-auto"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
              <label className="text-foreground flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={field.required ?? false}
                  onChange={(event) => {
                    onChange({
                      ...config,
                      fields: updateFieldAt(config.fields, index, {
                        required: event.target.checked,
                      }),
                    });
                  }}
                  className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
                />
                Required
              </label>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...config, fields: config.fields.filter((_, i) => i !== index) });
                }}
                aria-label="Remove field"
                className="text-muted-foreground hover:bg-muted hover:text-foreground ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            {field.type === 'SELECT' ? (
              <Input
                placeholder="Options, comma-separated"
                value={(field.options ?? []).join(', ')}
                onChange={(event) => {
                  const options = event.target.value
                    .split(',')
                    .map((option) => option.trim())
                    .filter(Boolean);
                  onChange({ ...config, fields: updateFieldAt(config.fields, index, { options }) });
                }}
              />
            ) : null}
          </div>
        ))
      )}
      <button
        type="button"
        onClick={() => {
          onChange({ ...config, fields: [...config.fields, emptyField()] });
        }}
        className="text-brand inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        Add field
      </button>
    </div>
  );
}
