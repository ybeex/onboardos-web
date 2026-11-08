'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { FormStepConfig } from '@/types/flow';

export interface FormStepActionProps {
  config: FormStepConfig;
  isSubmitting: boolean;
  onSubmit: (output: Record<string, unknown>) => void;
}

type FieldValue = string | boolean;

/**
 * Plain controlled state, not react-hook-form — same call M6's own
 * step-config-forms made for a config-driven, per-type field set (see
 * BUILD_PLAN.md's M6 retrospective): the field list is only known at
 * render time from `config.fields`, so there's no static form shape to
 * hand RHF's typed API.
 */
export function FormStepAction({ config, isSubmitting, onSubmit }: FormStepActionProps) {
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};
    for (const field of config.fields) {
      initial[field.key] = field.type === 'CHECKBOX' ? false : '';
    }
    return initial;
  });

  const missingRequired = config.fields.some(
    (field) =>
      field.required && field.type !== 'CHECKBOX' && !String(values[field.key] ?? '').trim(),
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      {config.fields.map((field) => {
        const fieldId = `step-form-${field.key}`;
        if (field.type === 'CHECKBOX') {
          return (
            <label key={field.key} className="text-foreground flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id={fieldId}
                checked={Boolean(values[field.key])}
                onChange={(event) => {
                  setValues((prev) => ({ ...prev, [field.key]: event.target.checked }));
                }}
                className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
              />
              {field.label}
              {field.required ? <span className="text-destructive">*</span> : null}
            </label>
          );
        }

        return (
          <Field
            key={field.key}
            label={field.label}
            htmlFor={fieldId}
            required={field.required ?? false}
          >
            {({ id }) =>
              field.type === 'SELECT' ? (
                <Select
                  id={id}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, [field.key]: event.target.value }));
                  }}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={id}
                  type={field.type === 'DATE' ? 'date' : 'text'}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, [field.key]: event.target.value }));
                  }}
                />
              )
            }
          </Field>
        );
      })}
      <Button type="submit" size="sm" isLoading={isSubmitting} disabled={missingRequired}>
        Submit
      </Button>
    </form>
  );
}
