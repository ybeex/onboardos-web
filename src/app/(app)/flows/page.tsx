'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Workflow as WorkflowIcon } from 'lucide-react';
import { listFlows } from '@/lib/api/flows';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { FlowStatusBadge } from '@/components/flows/flow-status-badge';
import { Select } from '@/components/ui/select';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Module, FlowStatus } from '@/types/enums';
import { MODULE_VALUES } from '@/types/enums';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: FlowStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export default function FlowsPage() {
  const [module, setModule] = useState<Module | ''>('');
  const [status, setStatus] = useState<FlowStatus | ''>('');

  const flowsQuery = useQuery({
    queryKey: ['flows', 'list', module, status],
    queryFn: () =>
      listFlows({
        ...(module ? { module } : {}),
        ...(status ? { status } : {}),
      }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold">Flows</h1>
          <p className="text-muted-foreground mt-1">
            Every onboarding flow across your activated modules.
          </p>
        </div>
        <Link href="/flows/new" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          New flow
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select
          value={module}
          onChange={(event) => {
            setModule(event.target.value as Module | '');
          }}
          className="w-auto"
          aria-label="Filter by module"
        >
          <option value="">All modules</option>
          {MODULE_VALUES.map((value) => (
            <option key={value} value={value}>
              {MODULE_LABELS[value]}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as FlowStatus | '');
          }}
          className="w-auto"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {flowsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : flowsQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load flows. Please try again.
          </p>
        ) : flowsQuery.data && flowsQuery.data.flows.length > 0 ? (
          flowsQuery.data.flows.map((flow) => (
            <Link
              key={flow.id}
              href={`/flows/${flow.id}`}
              className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                  <WorkflowIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-sm font-semibold">
                    {flow.name}
                  </p>
                  <p className="text-muted-foreground text-xs">{MODULE_LABELS[flow.module]}</p>
                </div>
              </div>
              <FlowStatusBadge status={flow.status} />
            </Link>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">No flows match these filters yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
