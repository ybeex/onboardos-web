'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listFlows } from '@/lib/api/flows';
import { createEnrollment } from '@/lib/api/enrollments';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export interface StartEnrollmentFormProps {
  entityId: string;
  onDone: () => void;
}

/**
 * Filtered to `status: 'PUBLISHED'` flows only — enrollment resolves
 * "the current published version" server-side and 400s otherwise
 * (`resolvePublishedVersionId` returning null), so an unpublished flow
 * would be a guaranteed-failing choice to even offer here.
 */
export function StartEnrollmentForm({ entityId, onDone }: StartEnrollmentFormProps) {
  const router = useRouter();
  const [flowId, setFlowId] = useState('');

  const flowsQuery = useQuery({
    queryKey: ['flows', 'picker', 'published'],
    queryFn: () => listFlows({ status: 'PUBLISHED' }),
  });

  const createMutation = useMutation({
    mutationFn: () => createEnrollment(entityId, { flowId }),
    onSuccess: (enrollment) => {
      toast.success('Enrollment started.');
      // A plain template literal works here (confirmed against
      // `.next/types/routes.d.ts` once `/enrollments/[enrollmentId]`
      // existed as a real route) — the earlier type error was only ever
      // "this dynamic route doesn't exist yet," not a real limitation on
      // combining a dynamic segment with a query string.
      router.push(`/enrollments/${enrollment.id}?flow=${flowId}`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not start this enrollment.');
    },
  });

  const flows = flowsQuery.data?.flows ?? [];

  return (
    <div className="border-border bg-muted/40 mt-4 space-y-4 rounded-lg border p-4">
      <Field label="Flow" htmlFor="enroll-flow">
        {({ id }) => (
          <Select
            id={id}
            value={flowId}
            onChange={(event) => {
              setFlowId(event.target.value);
            }}
            disabled={flowsQuery.isLoading}
          >
            <option value="">Select a published flow…</option>
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.name} — {MODULE_LABELS[flow.module]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {!flowsQuery.isLoading && flows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No published flows yet — publish one first.</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          isLoading={createMutation.isPending}
          disabled={!flowId}
          onClick={() => {
            createMutation.mutate();
          }}
        >
          Start enrollment
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
