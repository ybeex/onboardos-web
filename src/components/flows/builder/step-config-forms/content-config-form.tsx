import { Field, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { ContentStepConfig } from '@/types/flow';

export interface ContentConfigFormProps {
  config: ContentStepConfig;
  onChange: (config: ContentStepConfig) => void;
}

const DISPLAY_MODES: NonNullable<ContentStepConfig['displayMode']>[] = [
  'PAGE',
  'MODAL',
  'TOOLTIP',
  'SLIDEOUT',
  'BANNER',
];

/**
 * All 8 step config forms use this same controlled `(config, onChange)`
 * pattern rather than react-hook-form — StepEditorCard holds the
 * actual draft state and an explicit Save action; see that file's own
 * comment for why a form library fights a discriminated union with
 * genuinely different, sometimes-recursive shapes per type more than
 * it helps.
 */
export function ContentConfigForm({ config, onChange }: ContentConfigFormProps) {
  return (
    <div className="space-y-4">
      <Field label="Body" htmlFor="content-body" required>
        {({ id }) => (
          <Textarea
            id={id}
            rows={4}
            value={config.body}
            onChange={(event) => {
              onChange({ ...config, body: event.target.value });
            }}
          />
        )}
      </Field>

      <Field label="Display mode" htmlFor="content-display-mode" hint="Optional">
        {({ id }) => (
          <Select
            id={id}
            value={config.displayMode ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              const { displayMode: _displayMode, ...rest } = config;
              onChange(
                value
                  ? { ...rest, displayMode: value as NonNullable<ContentStepConfig['displayMode']> }
                  : rest,
              );
            }}
          >
            <option value="">Default</option>
            {DISPLAY_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <label className="text-foreground flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.readReceiptRequired ?? false}
          onChange={(event) => {
            onChange({ ...config, readReceiptRequired: event.target.checked });
          }}
          className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
        />
        Require a read receipt
      </label>
    </div>
  );
}
