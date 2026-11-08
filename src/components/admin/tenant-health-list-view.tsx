'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { listTenantHealth } from '@/lib/api/admin';
import { tenantHealthListQueryKey } from '@/lib/admin/query-keys';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_VALUES } from '@/types/enums';
import type { Module } from '@/types/enums';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { Stat } from '@/components/admin/stat';

const PAGE_SIZE = 20;

/**
 * `/admin` itself — the operational cross-tenant view, per
 * `tenant-health.service.ts`'s own doc comment. Cursor-paginated via
 * `useInfiniteQuery`, mirroring `(app)/entities/page.tsx`'s established
 * "Load more" pattern exactly (same shape of response: `{ items,
 * nextCursor }`, just `tenants` instead of `entities`).
 *
 * Available to every platform-admin role (verified: `SUPPORT, REVOPS,
 * COMPLIANCE, ENG_ON_CALL` + SUPER) — no role gating needed on this
 * page itself, unlike the module-override and impersonate actions that
 * live on the detail page.
 */
export function TenantHealthListView() {
  const [module, setModule] = useState<Module | ''>('');

  const tenantsQuery = useInfiniteQuery({
    queryKey: tenantHealthListQueryKey(module),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listTenantHealth({
        ...(module ? { module } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
        limit: PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const tenants = tenantsQuery.data?.pages.flatMap((page) => page.tenants) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <div>
        <h1 className="font-display text-foreground text-2xl font-bold">Tenants</h1>
        <p className="text-muted-foreground mt-1">
          Every tenant workspace with basic usage counts — the operational cross-tenant view.
        </p>
      </div>

      <div className="mt-6">
        <Select
          value={module}
          onChange={(event) => {
            setModule(event.target.value as Module | '');
          }}
          className="w-auto"
          aria-label="Filter by active module"
        >
          <option value="">All modules</option>
          {MODULE_VALUES.map((value) => (
            <option key={value} value={value}>
              {MODULE_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {tenantsQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))
        ) : tenantsQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load tenants. Please try again.
          </p>
        ) : tenants.length > 0 ? (
          tenants.map((tenant) => (
            <Link
              key={tenant.tenantId}
              href={`/admin/tenants/${tenant.tenantId}`}
              className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                  <Building2 aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-sm font-semibold">
                    {tenant.tenantName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{tenant.tenantSlug}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {tenant.activeModules.map((activeModule) => (
                      <Badge key={activeModule} variant="neutral">
                        {MODULE_LABELS[activeModule]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-4">
                <Stat label="Users" value={tenant.userCount} />
                <Stat label="Flows" value={tenant.flowCount} />
                <Stat label="Entities" value={tenant.entityCount} />
                <Stat label="Active" value={tenant.activeEnrollmentCount} />
              </div>
            </Link>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              {module ? 'No tenants have this module active.' : 'No tenants yet.'}
            </p>
          </div>
        )}
      </div>

      {tenantsQuery.hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            isLoading={tenantsQuery.isFetchingNextPage}
            onClick={() => {
              void tenantsQuery.fetchNextPage();
            }}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
