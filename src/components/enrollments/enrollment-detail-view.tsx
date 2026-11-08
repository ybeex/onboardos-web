'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { getEnrollmentDetail, completeStep } from '@/lib/api/enrollments';
import { getFlow } from '@/lib/api/flows';
import { getEntity } from '@/lib/api/entities';
import { enrollmentDetailQueryKey } from '@/lib/enrollments/query-keys';
import { flowDetailQueryKey } from '@/lib/flows/query-keys';
import { EnrollmentStatusBadge } from '@/components/enrollments/enrollment-status-badge';
import { StepExecutionTimeline } from '@/components/enrollments/step-execution-timeline';
import { Skeleton } from '@/components/ui/skeleton';
import type { EnrollmentDetail } from '@/types/enrollment';
import type { Step } from '@/types/flow';

export interface EnrollmentDetailViewProps {
  enrollmentId: string;
  /**
   * Known only when the caller already had it (the flow-scoped
   * enrollments list, or having just created this enrollment) — there
   * is no endpoint that resolves an Enrollment's `flowVersionId` back to
   * a flow or to that version's steps. See `@/types/enrollment`'s
   * header comment. Null degrades gracefully: the timeline still shows
   * every step execution's own status/output, just without real titles.
   */
  flowId: string | null;
}

export function EnrollmentDetailView({ enrollmentId, flowId }: EnrollmentDetailViewProps) {
  const queryClient = useQueryClient();
  const [completingExecutionId, setCompletingExecutionId] = useState<string | null>(null);

  const enrollmentQuery = useQuery({
    queryKey: enrollmentDetailQueryKey(enrollmentId),
    queryFn: () => getEnrollmentDetail(enrollmentId),
  });

  const flowQuery = useQuery({
    queryKey: flowDetailQueryKey(flowId ?? ''),
    queryFn: () => getFlow(flowId ?? ''),
    enabled: flowId !== null,
  });

  const entityId = enrollmentQuery.data?.enrollment.entityId ?? null;
  const entityQuery = useQuery({
    queryKey: ['entities', 'detail', entityId ?? ''],
    queryFn: () => getEntity(entityId ?? ''),
    enabled: entityId !== null,
  });

  const completeMutation = useMutation({
    mutationFn: ({
      stepExecutionId,
      output,
    }: {
      stepExecutionId: string;
      output: Record<string, unknown>;
    }) => completeStep(enrollmentId, stepExecutionId, { output }),
    onMutate: ({ stepExecutionId }) => {
      setCompletingExecutionId(stepExecutionId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<EnrollmentDetail>(enrollmentDetailQueryKey(enrollmentId), data);
      toast.success('Step completed.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not complete this step.');
    },
    onSettled: () => {
      setCompletingExecutionId(null);
    },
  });

  if (enrollmentQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (enrollmentQuery.isError || !enrollmentQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this enrollment.</p>
      </div>
    );
  }

  const { enrollment, stepExecutions } = enrollmentQuery.data;

  // Only trusted when every stepId it would be asked to resolve actually
  // belongs to the *same* FlowVersion this enrollment is pinned to.
  // `GET /flows/:flowId` only ever returns the CURRENT version's steps —
  // close enough right after creating a brand-new enrollment, but a flow
  // edited and republished since gives every step a new id (see
  // `ensureFlowDraft`'s doc comment), so `stepById.get(...)` below simply
  // returns undefined per-row for a stale version rather than this
  // needing to detect the mismatch up front.
  const stepById: Map<string, Step> | null = flowQuery.data
    ? new Map(flowQuery.data.steps.map((step) => [step.id, step]))
    : null;

  const entityLabel = entityQuery.data?.displayName ?? enrollment.entityId;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
      {flowId && flowQuery.data ? (
        <Link
          href={`/flows/${flowId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          {flowQuery.data.flow.name}
        </Link>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-foreground text-2xl font-bold">
          {entityId ? (
            <Link href={`/entities/${entityId}`} className="hover:underline">
              {entityLabel}
            </Link>
          ) : (
            entityLabel
          )}
        </h1>
        <EnrollmentStatusBadge status={enrollment.status} />
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Started {new Date(enrollment.startedAt).toLocaleString()}
        {enrollment.completedAt
          ? ` · Ended ${new Date(enrollment.completedAt).toLocaleString()}`
          : ''}
      </p>
      {enrollment.status === 'FAILED' && enrollment.failureReason ? (
        <p className="bg-destructive/10 text-destructive mt-4 rounded-md px-3 py-2 text-sm">
          {enrollment.failureReason}
        </p>
      ) : null}

      <div className="mt-8">
        <StepExecutionTimeline
          executions={stepExecutions}
          stepById={stepById}
          completingExecutionId={completingExecutionId}
          onCompleteStep={(execution, output) => {
            completeMutation.mutate({ stepExecutionId: execution.id, output });
          }}
        />
      </div>
    </div>
  );
}
