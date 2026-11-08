'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { listImpersonationActivity } from '@/lib/api/admin';
import { parseAuditMetadata } from '@/types/admin';
import type { ImpersonationAuditEntry } from '@/types/admin';
import { impersonationActivityQueryKey } from '@/lib/admin/query-keys';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { hasAnyPlatformRole } from '@/types/enums';
import { Field, Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ALLOWED_ROLES = ['SUPPORT', 'COMPLIANCE', 'ENG_ON_CALL'] as const;
const ENTRY_LIMIT = 100;

/**
 * `platform_admin.impersonation_started` /
 * `platform_admin.impersonated_request` are the two actions the
 * verified contract names, but `action` is a raw `audit_log.action`
 * string with no enum behind it (see `ImpersonationAuditEntry`'s own
 * comment) — this formats ANY `noun.snake_case` action generically
 * rather than hardcoding a lookup table that would silently stop
 * working the day a third action is added.
 */
function formatAction(action: string): string {
  const withoutPrefix = action.startsWith('platform_admin.')
    ? action.slice('platform_admin.'.length)
    : action;
  const words = withoutPrefix.split('_').join(' ');
  return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : action;
}

function MetadataList({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata);
  if (entries.length === 0) return null;
  return (
    <dl className="mt-2 space-y-0.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-1.5 text-xs">
          <dt className="text-muted-foreground shrink-0 font-medium">{key}:</dt>
          <dd className="text-foreground truncate">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ActivityRow({ entry }: { entry: ImpersonationAuditEntry }) {
  const metadata = parseAuditMetadata(entry);
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={entry.action.endsWith('_started') ? 'brand' : 'neutral'}>
            {formatAction(entry.action)}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {new Date(entry.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="text-muted-foreground mt-2 grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2">
        {entry.tenantId ? <span>Tenant: {entry.tenantId}</span> : null}
        {entry.actorPlatformAdminId ? <span>Admin: {entry.actorPlatformAdminId}</span> : null}
        {entry.targetType && entry.targetId ? (
          <span>
            Target: {entry.targetType} {entry.targetId}
          </span>
        ) : null}
      </div>
      {metadata ? <MetadataList metadata={metadata} /> : null}
    </div>
  );
}

/**
 * `/admin/impersonation-activity` — SUPPORT, COMPLIANCE, ENG_ON_CALL
 * only (REVOPS is deliberately excluded, see BUILD_PLAN.md Section 4;
 * `AdminTopbar` already hides this page's own nav link for a REVOPS
 * admin, but a direct URL visit still needs this page's own check,
 * since the backend would 403 the query anyway). Unlike every other
 * admin list in this app, there is no cursor in the verified response
 * shape (`{ entries: [...] }`, nothing else) — this is a flat,
 * most-recent-`ENTRY_LIMIT` view with id/tenant filters, not a
 * `useInfiniteQuery`.
 *
 * Each row is a raw `audit_log` entry, not a purpose-built DTO — see
 * `ImpersonationAuditEntry`'s own comment. `metadata` is rendered
 * generically (whatever keys `parseAuditMetadata` finds) rather than
 * special-cased per `action`, for the same reason `formatAction` below
 * doesn't hardcode a lookup table.
 */
export function ImpersonationActivityView() {
  const { admin } = useAdminAuth();
  const [tenantFilter, setTenantFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  const canView = admin ? hasAnyPlatformRole(admin.role, [...ALLOWED_ROLES]) : false;
  const params = {
    ...(tenantFilter.trim() ? { tenantId: tenantFilter.trim() } : {}),
    ...(adminFilter.trim() ? { platformAdminId: adminFilter.trim() } : {}),
    limit: ENTRY_LIMIT,
  };

  const activityQuery = useQuery({
    queryKey: impersonationActivityQueryKey(params),
    queryFn: () => listImpersonationActivity(params),
    enabled: canView,
  });

  if (!canView) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Impersonation activity isn&rsquo;t available for your role.
        </p>
      </div>
    );
  }

  const entries = activityQuery.data?.entries ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <div>
        <h1 className="font-display text-foreground text-2xl font-bold">Impersonation Activity</h1>
        <p className="text-muted-foreground mt-1">
          The most recent {ENTRY_LIMIT} audit log entries for impersonation sessions and the
          requests made under them.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Filter by tenant ID" htmlFor="activity-tenant-filter">
          {({ id }) => (
            <Input
              id={id}
              value={tenantFilter}
              onChange={(event) => {
                setTenantFilter(event.target.value);
              }}
              placeholder="Tenant UUID…"
            />
          )}
        </Field>
        <Field label="Filter by admin ID" htmlFor="activity-admin-filter">
          {({ id }) => (
            <Input
              id={id}
              value={adminFilter}
              onChange={(event) => {
                setAdminFilter(event.target.value);
              }}
              placeholder="Platform admin UUID…"
            />
          )}
        </Field>
      </div>

      <div className="mt-6 space-y-3">
        {activityQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))
        ) : activityQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load impersonation activity. Please try again.
          </p>
        ) : entries.length > 0 ? (
          entries.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <History aria-hidden="true" className="text-muted-foreground mx-auto h-6 w-6" />
            <p className="text-muted-foreground mt-2 text-sm">
              {tenantFilter.trim() || adminFilter.trim()
                ? 'No impersonation activity matches these filters.'
                : 'No impersonation activity yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
