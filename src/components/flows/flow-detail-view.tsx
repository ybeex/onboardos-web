'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, ListChecks } from 'lucide-react';
import { getFlow, publishFlow } from '@/lib/api/flows';
import { FlowStatusBadge } from '@/components/flows/flow-status-badge';
import { StepSummaryCard } from '@/components/flows/step-summary-card';
import { TriggersSection } from '@/components/flows/triggers-section';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { flowDetailQueryKey } from '@/lib/flows/query-keys';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FlowDetail } from '@/types/flow';

export interface FlowDetailViewProps {
  flowId: string;
}

export function FlowDetailView({ flowId }: FlowDetailViewProps) {
  const queryClient = useQueryClient();

  const flowQuery = useQuery({
    queryKey: flowDetailQueryKey(flowId),
    queryFn: () => getFlow(flowId),
  });

  // publishFlow resolves to just the updated FlowVersion (see its own
  // comment in lib/api/flows.ts), not a full FlowDetail — writing that
  // bare version straight into this cache key would silently blow away
  // `flow` and `steps` for the rest of the page's lifetime (nothing
  // re-fetches afterward), so it's merged into the existing
  // currentVersion instead of replacing the whole cache entry.
  const publishMutation = useMutation({
    mutationFn: () => publishFlow(flowId),
    onSuccess: (updatedVersion) => {
      queryClient.setQueryData<FlowDetail>(flowDetailQueryKey(flowId), (old) =>
        old ? { ...old, currentVersion: updatedVersion } : old,
      );
      toast.success('Flow published.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not publish this flow.');
    },
  });

  if (flowQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (flowQuery.isError || !flowQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this flow.</p>
      </div>
    );
  }

  const { flow, currentVersion, steps } = flowQuery.data;
  const stepTitleById = new Map(steps.map((step) => [step.id, step.title]));
  // Defensive, not compensating for a real gap — Section 4 already
  // guarantees `GET /flows/:flowId` returns steps ordered by
  // `position`. Kept in case this component (flagged as likely reused
  // by M6/M7) is later fed steps from a source that doesn't.
  const sortedSteps = [...steps].sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-foreground text-2xl font-bold">{flow.name}</h1>
            <FlowStatusBadge status={currentVersion.status} />
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{MODULE_LABELS[flow.module]}</p>
          {flow.description ? (
            <p className="text-muted-foreground mt-3">{flow.description}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/enrollments?flow=${flowId}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'md' }))}
          >
            <ListChecks aria-hidden="true" className="h-4 w-4" />
            View enrollments
          </Link>
          <Link
            href={`/flows/${flowId}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Edit
          </Link>
          {currentVersion.status === 'DRAFT' ? (
            <Button
              variant="primary"
              isLoading={publishMutation.isPending}
              onClick={() => {
                publishMutation.mutate();
              }}
            >
              Publish
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {sortedSteps.length === 0 ? (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">This flow has no steps yet.</p>
          </div>
        ) : (
          sortedSteps.map((step, index) => (
            <StepSummaryCard
              key={step.id}
              step={step}
              index={index}
              stepTitleById={stepTitleById}
            />
          ))
        )}
      </div>

      <TriggersSection flowId={flowId} />
    </div>
  );
}
