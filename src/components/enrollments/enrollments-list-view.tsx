'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ListChecks } from 'lucide-react';
import { listFlows, getFlow } from '@/lib/api/flows';
import { listEnrollmentsForFlow } from '@/lib/api/enrollments';
import { flowEnrollmentsQueryKey } from '@/lib/enrollments/query-keys';
import { flowDetailQueryKey } from '@/lib/flows/query-keys';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { EnrollmentStatusBadge } from '@/components/enrollments/enrollment-status-badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ENROLLMENT_STATUS_VALUES } from '@/types/enums';
import type { EnrollmentStatus } from '@/types/enums';

export interface EnrollmentsListViewProps {
  /** A pre-selected flow handed off by whoever linked here (e.g. a flow's own "View enrollments" link) — a plain initial value, not a reactively-synced URL param; changing the picker below never rewrites the URL, matching `/flows/page.tsx`'s own module/status filters (plain local state, no query-string persistence). */
  initialFlowId: string | null;
}

/**
 * There is no "list every enrollment" endpoint on the real backend —
 * only `GET /flows/:flowId/enrollments`, matching its own documented
 * framing: "cross-entity visibility into a single flow," not a
 * tenant-wide feed. This page is a flow picker for exactly that reason,
 * not a workaround — see `@/lib/api/enrollments`'s header comment.
 *
 * Each row shows the entity by its raw id, not a resolved display name:
 * there's likewise no batch "get these entities" endpoint, and fetching
 * one-by-one per row would be a real N+1 against the API for a feature
 * that's supposed to be a quick bottleneck scan. The current-step
 * column doesn't have this problem — it costs exactly one extra
 * `getFlow` call for the whole list, not one per row — but inherits the
 * same current-version-only caveat as the enrollment detail page (see
 * `@/types/enrollment`'s header comment).
 */
export function EnrollmentsListView({ initialFlowId }: EnrollmentsListViewProps) {
  const [flowId, setFlowId] = useState(initialFlowId ?? '');
  const [status, setStatus] = useState<EnrollmentStatus | ''>('');

  const flowsQuery = useQuery({
    queryKey: ['flows', 'picker', 'published'],
    queryFn: () => listFlows({ status: 'PUBLISHED' }),
  });

  const flowDetailQuery = useQuery({
    queryKey: flowDetailQueryKey(flowId),
    queryFn: () => getFlow(flowId),
    enabled: flowId !== '',
  });

  const enrollmentsQuery = useQuery({
    queryKey: flowEnrollmentsQueryKey(flowId || 'none'),
    queryFn: () => listEnrollmentsForFlow(flowId, status ? { status } : {}),
    enabled: flowId !== '',
  });

  const flows = flowsQuery.data?.flows ?? [];
  const stepTitleById = new Map(
    (flowDetailQuery.data?.steps ?? []).map((step) => [step.id, step.title]),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <h1 className="font-display text-foreground text-2xl font-bold">Enrollments</h1>
      <p className="text-muted-foreground mt-1">
        Pick a flow to see every entity currently moving through it, and exactly where each one is
        stuck.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          value={flowId}
          onChange={(event) => {
            setFlowId(event.target.value);
          }}
          className="w-auto"
          aria-label="Choose a flow"
          disabled={flowsQuery.isLoading}
        >
          <option value="">Choose a flow…</option>
          {flows.map((flow) => (
            <option key={flow.id} value={flow.id}>
              {flow.name} — {MODULE_LABELS[flow.module]}
            </option>
          ))}
        </Select>
        {flowId ? (
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as EnrollmentStatus | '');
            }}
            className="w-auto"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {ENROLLMENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {flowId === '' ? (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <ListChecks aria-hidden="true" className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground mt-3 text-sm">
              Choose a flow above to see its enrollments.
            </p>
          </div>
        ) : enrollmentsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : enrollmentsQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load enrollments. Please try again.
          </p>
        ) : enrollmentsQuery.data && enrollmentsQuery.data.enrollments.length > 0 ? (
          enrollmentsQuery.data.enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={{ pathname: `/enrollments/${enrollment.id}`, query: { flow: flowId } }}
              className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="min-w-0">
                <p className="font-display text-foreground truncate text-sm font-semibold">
                  Entity {enrollment.entityId.slice(-8)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {enrollment.currentStepId
                    ? (stepTitleById.get(enrollment.currentStepId) ??
                      `Step ${enrollment.currentStepId.slice(-6)}`)
                    : 'No active step'}
                </p>
              </div>
              <EnrollmentStatusBadge status={enrollment.status} />
            </Link>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">No enrollments match these filters yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
