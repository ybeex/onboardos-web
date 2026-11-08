'use client';

import { Users, Building2, Workflow, FileEdit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/auth-provider';
import { listEntities } from '@/lib/api/entities';
import { listFlows } from '@/lib/api/flows';
import { StatCard } from '@/components/app/stat-card';

/**
 * There's no dedicated backend stats/aggregate endpoint (checked
 * Section 4 — none exists), so these are real counts computed from
 * the actual list endpoints, not placeholder numbers:
 *  - People/Accounts: `GET /entities` is keyset-paginated with no
 *    total count field. Requesting ENTITY_COUNT_LIMIT and checking
 *    `nextCursor` gives an honest "100+" rather than a wrong exact
 *    number once a tenant has more than that.
 *  - Published/Draft flows: `GET /flows` isn't paginated per Section
 *    4, and accepts a `status` filter, so these two counts are exact.
 */
const ENTITY_COUNT_LIMIT = 100;

function formatEntityCount(count: number, hasMore: boolean): string {
  return hasMore ? `${String(count)}+` : String(count);
}

export default function DashboardPage() {
  const { user, tenant } = useAuth();

  const peopleQuery = useQuery({
    queryKey: ['entities', 'PERSON', 'count'],
    queryFn: () => listEntities({ type: 'PERSON', limit: ENTITY_COUNT_LIMIT }),
  });
  const accountsQuery = useQuery({
    queryKey: ['entities', 'ACCOUNT', 'count'],
    queryFn: () => listEntities({ type: 'ACCOUNT', limit: ENTITY_COUNT_LIMIT }),
  });
  const publishedFlowsQuery = useQuery({
    queryKey: ['flows', 'PUBLISHED'],
    queryFn: () => listFlows({ status: 'PUBLISHED' }),
  });
  const draftFlowsQuery = useQuery({
    queryKey: ['flows', 'DRAFT'],
    queryFn: () => listFlows({ status: 'DRAFT' }),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <h1 className="font-display text-foreground text-2xl font-bold">Welcome, {user?.fullName}</h1>
      <p className="text-muted-foreground mt-1">
        Here&rsquo;s what&rsquo;s happening at{' '}
        <span className="text-foreground font-medium">{tenant?.name}</span>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="People"
          value={
            peopleQuery.data
              ? formatEntityCount(
                  peopleQuery.data.entities.length,
                  Boolean(peopleQuery.data.nextCursor),
                )
              : undefined
          }
          isLoading={peopleQuery.isLoading}
          isError={peopleQuery.isError}
        />
        <StatCard
          icon={Building2}
          label="Accounts"
          value={
            accountsQuery.data
              ? formatEntityCount(
                  accountsQuery.data.entities.length,
                  Boolean(accountsQuery.data.nextCursor),
                )
              : undefined
          }
          isLoading={accountsQuery.isLoading}
          isError={accountsQuery.isError}
        />
        <StatCard
          icon={Workflow}
          label="Published flows"
          value={
            publishedFlowsQuery.data ? String(publishedFlowsQuery.data.flows.length) : undefined
          }
          isLoading={publishedFlowsQuery.isLoading}
          isError={publishedFlowsQuery.isError}
        />
        <StatCard
          icon={FileEdit}
          label="Draft flows"
          value={draftFlowsQuery.data ? String(draftFlowsQuery.data.flows.length) : undefined}
          isLoading={draftFlowsQuery.isLoading}
          isError={draftFlowsQuery.isError}
        />
      </div>
    </div>
  );
}
