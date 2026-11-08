import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Condition } from '@/types/flow';

const SIMPLE_OPS = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'nin',
  'exists',
  'notExists',
] as const;
type SimpleOp = (typeof SIMPLE_OPS)[number];

export type SimpleCondition = Extract<Condition, { op: SimpleOp }>;

export function isSimpleCondition(condition: Condition): condition is SimpleCondition {
  return (SIMPLE_OPS as readonly string[]).includes(condition.op);
}

const OP_LABELS: Record<SimpleOp, string> = {
  eq: 'is',
  neq: 'is not',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  in: 'is one of',
  nin: 'is none of',
  exists: 'is set',
  notExists: 'is not set',
};

/** Best-effort text → typed value coercion for a schema-less condition value, since the form only ever collects plain text. */
function coerceValue(text: string): string | number | boolean {
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text.trim() !== '' && !Number.isNaN(Number(text))) return Number(text);
  return text;
}

function valueToText(value: string | number | boolean): string {
  return String(value);
}

export function emptySimpleCondition(): SimpleCondition {
  return { op: 'eq', path: '', value: '' };
}

export interface SimpleConditionEditorProps {
  condition: SimpleCondition;
  onChange: (condition: SimpleCondition) => void;
}

function renderValueInput(
  condition: SimpleCondition,
  onChange: (condition: SimpleCondition) => void,
) {
  switch (condition.op) {
    case 'in':
    case 'nin':
      return (
        <Input
          placeholder="Values, comma-separated"
          value={condition.values.map(String).join(', ')}
          onChange={(event) => {
            const values = event.target.value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item) => coerceValue(item))
              .filter((item): item is string | number => typeof item !== 'boolean');
            onChange({ ...condition, values });
          }}
          className="min-w-40 flex-1"
        />
      );
    case 'exists':
    case 'notExists':
      return null;
    default:
      return (
        <Input
          placeholder="Value"
          value={valueToText(condition.value)}
          onChange={(event) => {
            onChange({ ...condition, value: coerceValue(event.target.value) });
          }}
          className="min-w-32 flex-1"
        />
      );
  }
}

export function SimpleConditionEditor({ condition, onChange }: SimpleConditionEditorProps) {
  function handleOpChange(nextOp: SimpleOp): void {
    if (nextOp === 'exists' || nextOp === 'notExists') {
      onChange({ op: nextOp, path: condition.path });
    } else if (nextOp === 'in' || nextOp === 'nin') {
      onChange({ op: nextOp, path: condition.path, values: [] });
    } else {
      onChange({ op: nextOp, path: condition.path, value: '' });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="entity.attributes.plan"
        value={condition.path}
        onChange={(event) => {
          onChange({ ...condition, path: event.target.value });
        }}
        className="min-w-40 flex-1"
      />
      <Select
        value={condition.op}
        onChange={(event) => {
          handleOpChange(event.target.value as SimpleOp);
        }}
        className="w-auto"
      >
        {SIMPLE_OPS.map((op) => (
          <option key={op} value={op}>
            {OP_LABELS[op]}
          </option>
        ))}
      </Select>
      {renderValueInput(condition, onChange)}
    </div>
  );
}
