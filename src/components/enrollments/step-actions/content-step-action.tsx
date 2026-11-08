'use client';

import { Button } from '@/components/ui/button';
import type { ContentStepConfig } from '@/types/flow';

export interface ContentStepActionProps {
  config: ContentStepConfig;
  isSubmitting: boolean;
  onSubmit: (output: Record<string, unknown>) => void;
}

/**
 * Only ever rendered for a WAITING CONTENT step, which per the engine's
 * `isAutoAdvance` only happens when `readReceiptRequired` is true — a
 * CONTENT step without it auto-advances and is never actionable here.
 */
export function ContentStepAction({ config, isSubmitting, onSubmit }: ContentStepActionProps) {
  return (
    <div className="space-y-3">
      <p className="text-foreground text-sm whitespace-pre-wrap">{config.body}</p>
      <Button
        size="sm"
        isLoading={isSubmitting}
        onClick={() => {
          onSubmit({});
        }}
      >
        Acknowledge
      </Button>
    </div>
  );
}
