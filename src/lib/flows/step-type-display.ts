import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  ListChecks,
  CheckSquare,
  ThumbsUp,
  ShieldCheck,
  GitBranch,
  PenLine,
  Zap,
} from 'lucide-react';
import type { Step } from '@/types/flow';

/**
 * Single source for the icon/label shown per StepType — used by
 * StepSummaryCard (M5, read-only), StepEditorCard and FlowBuilderView
 * (M6, editable). Originally duplicated in the first two; consolidated
 * here once a third consumer made the duplication real rather than
 * hypothetical.
 */
export const STEP_TYPE_ICON: Record<Step['type'], LucideIcon> = {
  CONTENT: FileText,
  FORM: ListChecks,
  TASK: CheckSquare,
  APPROVAL: ThumbsUp,
  VERIFICATION: ShieldCheck,
  CONDITIONAL_BRANCH: GitBranch,
  ESIGN: PenLine,
  INTEGRATION_TRIGGER: Zap,
};

export const STEP_TYPE_LABEL: Record<Step['type'], string> = {
  CONTENT: 'Content',
  FORM: 'Form',
  TASK: 'Task',
  APPROVAL: 'Approval',
  VERIFICATION: 'Verification',
  CONDITIONAL_BRANCH: 'Branch',
  ESIGN: 'E-sign',
  INTEGRATION_TRIGGER: 'Integration',
};

export const ALL_STEP_TYPES: Step['type'][] = [
  'CONTENT',
  'FORM',
  'TASK',
  'APPROVAL',
  'VERIFICATION',
  'CONDITIONAL_BRANCH',
  'ESIGN',
  'INTEGRATION_TRIGGER',
];
