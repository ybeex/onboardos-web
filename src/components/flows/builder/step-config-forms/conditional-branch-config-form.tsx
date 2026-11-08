import { Plus, X } from 'lucide-react';
import { formatCondition } from '@/lib/flows/format-condition';
import {
  SimpleConditionEditor,
  isSimpleCondition,
  emptySimpleCondition,
} from './simple-condition-editor';
import { NextStepSelect } from './next-step-select';
import type { StepOption } from './next-step-select';
import type { ConditionalBranchStepConfig, ConditionalBranch } from '@/types/flow';

export interface ConditionalBranchConfigFormProps {
  config: ConditionalBranchStepConfig;
  onChange: (config: ConditionalBranchStepConfig) => void;
  otherSteps: StepOption[];
}

function updateBranchAt(
  branches: ConditionalBranch[],
  index: number,
  patch: Partial<ConditionalBranch>,
): ConditionalBranch[] {
  return branches.map((branch, i) => (i === index ? { ...branch, ...patch } : branch));
}

/**
 * Simple (non-compound) conditions get the real interactive editor —
 * "if Plan is Enterprise," never a JSON box, per M6's own spec. AND /
 * OR / NOT compound conditions are shown read-only via the same
 * formatter M5's step summaries use — a deliberate scope boundary for
 * this pass, not a silent gap: flagged here, in the branch itself, and
 * in BUILD_PLAN.md's M6 section.
 */
export function ConditionalBranchConfigForm({
  config,
  onChange,
  otherSteps,
}: ConditionalBranchConfigFormProps) {
  return (
    <div className="space-y-3">
      {config.branches.length === 0 ? (
        <p className="text-muted-foreground text-sm">No branches yet.</p>
      ) : (
        config.branches.map((branch, index) => (
          <div key={index} className="border-border space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                If
              </p>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...config, branches: config.branches.filter((_, i) => i !== index) });
                }}
                aria-label="Remove branch"
                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>

            {isSimpleCondition(branch.when) ? (
              <SimpleConditionEditor
                condition={branch.when}
                onChange={(when) => {
                  onChange({
                    ...config,
                    branches: updateBranchAt(config.branches, index, { when }),
                  });
                }}
              />
            ) : (
              <p className="bg-muted/60 text-muted-foreground rounded-md px-3 py-2 text-sm">
                {formatCondition(branch.when)}
                <span className="mt-1 block text-xs italic">
                  Compound condition — not editable here yet. Delete and recreate this branch to
                  change it.
                </span>
              </p>
            )}

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Then go to
              </p>
              <NextStepSelect
                value={branch.nextStepId || null}
                onChange={(nextStepId) => {
                  onChange({
                    ...config,
                    branches: updateBranchAt(config.branches, index, {
                      nextStepId: nextStepId ?? '',
                    }),
                  });
                }}
                options={otherSteps}
                nullLabel="Select a step…"
              />
            </div>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={() => {
          onChange({
            ...config,
            branches: [...config.branches, { when: emptySimpleCondition(), nextStepId: '' }],
          });
        }}
        className="text-brand inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        Add branch
      </button>
    </div>
  );
}
