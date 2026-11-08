/**
 * Tenant health: one key per `module` filter value, one per
 * single-tenant detail. Deliberately excludes `cursor` — this list is
 * paginated via `useInfiniteQuery`, which owns paging internally
 * through `pageParam`/`getNextPageParam`; folding `cursor` into the
 * key itself would give every page its own cache entry instead of one
 * growing list, the same mistake `(app)/entities/page.tsx`'s own
 * `useInfiniteQuery` call avoids by keying on `type` alone. Module
 * override writes invalidate both the detail and every list key, since
 * a tenant's row in the list also shows `activeModules`.
 */
export const tenantHealthListQueryKey = (module?: string) =>
  ['admin', 'tenants', 'list', module ?? null] as const;

export const tenantHealthDetailQueryKey = (tenantId: string) =>
  ['admin', 'tenants', 'detail', tenantId] as const;

/** One key per `tenantId` filter value (including the unfiltered, GLOBAL-only case) — a write invalidates all of them since a single flag change can't cheaply predict which filtered views it affects. */
export const featureFlagsQueryKey = (tenantId?: string) =>
  ['admin', 'feature-flags', tenantId ?? null] as const;

export const impersonationActivityQueryKey = (
  params: { tenantId?: string; platformAdminId?: string } = {},
) => ['admin', 'impersonation-activity', params] as const;
