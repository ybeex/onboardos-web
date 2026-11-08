'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';

export interface ApprovalStepActionProps {
  isSubmitting: boolean;
  onSubmit: (output: Record<string, unknown>) => void;
}

/**
 * APPROVAL only — VERIFICATION's decision is deliberately NOT made here
 * even though it shares this same `resolveDecisionBranch`/`onRejectStepId`
 * mechanism on the backend. A KYC decision resolves through the
 * verification session's own manual-review/webhook path
 * (`verification-step-action.tsx`), never a generic approve/reject
 * button on the enrollment timeline — see that component's header
 * comment for why.
 */
export function ApprovalStepAction({ isSubmitting, onSubmit }: ApprovalStepActionProps) {
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-3">
      <Field label="Notes (optional)" htmlFor="approval-notes">
        {({ id }) => (
          <Textarea
            id={id}
            rows={3}
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
            placeholder="Used as the failure reason if you reject with no further step defined."
          />
        )}
      </Field>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          leadingIcon={<ThumbsUp aria-hidden="true" className="h-4 w-4" />}
          onClick={() => {
            onSubmit({ decision: 'approved', notes: notes.trim() || undefined });
          }}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          isLoading={isSubmitting}
          leadingIcon={<ThumbsDown aria-hidden="true" className="h-4 w-4" />}
          onClick={() => {
            onSubmit({ decision: 'rejected', notes: notes.trim() || undefined });
          }}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
