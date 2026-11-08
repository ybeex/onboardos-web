import type { Condition } from '@/types/flow';

/**
 * Renders a Condition AST as plain language — "Plan is Enterprise,"
 * never a JSON box. M5 uses this for read-only step summaries; M6's
 * interactive branch editor (rendering the same AST as editable rows,
 * not just text) will likely want the same per-operator phrasing this
 * establishes, even though it needs a different, interactive rendering
 * rather than a single formatted string.
 */

function formatPath(path: string): string {
  // Strips the common "entity.attributes." prefix (the documented
  // convention — see types/flow.ts's Condition comment) for
  // readability. Paths that don't match the convention render as-is.
  return path.replace(/^entity\.attributes\./, '');
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function formatCondition(condition: Condition): string {
  switch (condition.op) {
    case 'eq':
      return `${formatPath(condition.path)} is ${formatValue(condition.value)}`;
    case 'neq':
      return `${formatPath(condition.path)} is not ${formatValue(condition.value)}`;
    case 'gt':
      return `${formatPath(condition.path)} is greater than ${formatValue(condition.value)}`;
    case 'gte':
      return `${formatPath(condition.path)} is at least ${formatValue(condition.value)}`;
    case 'lt':
      return `${formatPath(condition.path)} is less than ${formatValue(condition.value)}`;
    case 'lte':
      return `${formatPath(condition.path)} is at most ${formatValue(condition.value)}`;
    case 'in':
      return `${formatPath(condition.path)} is one of ${condition.values.map(String).join(', ')}`;
    case 'nin':
      return `${formatPath(condition.path)} is none of ${condition.values.map(String).join(', ')}`;
    case 'exists':
      return `${formatPath(condition.path)} is set`;
    case 'notExists':
      return `${formatPath(condition.path)} is not set`;
    case 'and':
      return condition.conditions.map(formatCondition).join(' AND ');
    case 'or':
      return condition.conditions.map(formatCondition).join(' OR ');
    case 'not':
      return `NOT (${formatCondition(condition.condition)})`;
  }
}
