import { adminApiFetch, AdminApiError } from '@/lib/api/admin-client';
import { getAdminAccessToken } from '@/lib/api/admin-auth-bridge';
import type {
  PlatformAdmin,
  FeatureFlag,
  TenantHealthSummary,
  ImpersonationAuditEntry,
} from '@/types/admin';
import type { Module, FeatureFlagScope } from '@/types/enums';
import type { AuthUser, AuthTenant } from '@/types/auth';

/**
 * Milestone 9's `/v1/admin/*` surface — verified against the real
 * backend source (see BUILD_PLAN.md Section 4's Super Admin Dashboard
 * block for the full contract, including exactly which
 * `PlatformAdminRole` is allowed on which route — it's an allow-list
 * per route, not a rank, so check that section rather than assuming).
 */

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResult {
  admin: PlatformAdmin;
  accessToken: string;
  expiresInSeconds: number;
}

/**
 * `POST /admin/auth/login` — deliberately NOT routed through
 * `adminApiFetch`. That wrapper's 401 handling means "an authenticated
 * call's session just died," which triggers `AdminAuthProvider`'s
 * session-clearing side effect; a failed LOGIN attempt is a completely
 * different situation (wrong credentials, nothing to clear) and needs
 * its own plain error, not "your session has expired." Calls the
 * backend directly, the same way every other `lib/api/*` function does
 * — see BUILD_PLAN.md's note on why admin login needs no BFF proxy at
 * all (no refresh token to keep off the client, unlike tenant login).
 */
export async function adminLogin(input: AdminLoginInput): Promise<AdminLoginResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new AdminApiError(500, 'NEXT_PUBLIC_API_URL is not configured.');
  }
  const response = await fetch(`${apiUrl}/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    let message = 'Could not sign in. Please try again.';
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message;
      }
    } catch {
      // Backend didn't return JSON — keep the fallback.
    }
    throw new AdminApiError(response.status, message);
  }
  return (await response.json()) as AdminLoginResult;
}

/** `GET /admin/auth/me` — any authenticated platform admin. Not called anywhere in the current UI flow (login already returns the full `PlatformAdmin`, and there is no session-restore-on-reload to refresh it for); kept because it's part of the verified contract and essentially free to wire up. */
export async function getCurrentAdmin(): Promise<PlatformAdmin> {
  return adminApiFetch<PlatformAdmin>('/v1/admin/auth/me');
}

export interface ListTenantHealthParams {
  module?: Module;
  limit?: number;
  cursor?: string;
}

export interface ListTenantHealthResult {
  tenants: TenantHealthSummary[];
  nextCursor: string | null;
}

/** `GET /admin/tenants` (SUPPORT, REVOPS, COMPLIANCE, ENG_ON_CALL — i.e. every role). Cursor-paginated, ordered by `tenantId` ascending. */
export async function listTenantHealth(
  params: ListTenantHealthParams = {},
): Promise<ListTenantHealthResult> {
  const query = new URLSearchParams();
  if (params.module) query.set('module', params.module);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const qs = query.toString();
  return adminApiFetch<ListTenantHealthResult>(`/v1/admin/tenants${qs ? `?${qs}` : ''}`);
}

/** `GET /admin/tenants/:id` (same roles as the list). Returns the identical `TenantHealthSummary` shape as a list row — see that type's own comment. */
export async function getTenantHealth(tenantId: string): Promise<TenantHealthSummary> {
  return adminApiFetch<TenantHealthSummary>(`/v1/admin/tenants/${tenantId}`);
}

export interface SetTenantModulesInput {
  /** Replaces the tenant's full active-modules list — not a diff/patch. */
  activeModules: Module[];
  /** Required, 10-500 chars, freeform — audited verbatim. */
  reason: string;
}

export interface SetTenantModulesResult {
  tenantId: string;
  activeModules: Module[];
}

/** `PUT /admin/tenants/:tenantId/modules` (REVOPS only). */
export async function setTenantModules(
  tenantId: string,
  input: SetTenantModulesInput,
): Promise<SetTenantModulesResult> {
  return adminApiFetch<SetTenantModulesResult>(`/v1/admin/tenants/${tenantId}/modules`, {
    method: 'PUT',
    body: input,
  });
}

export interface ListFeatureFlagsResult {
  flags: FeatureFlag[];
}

/** `GET /admin/feature-flags` (every role). `tenantId` mixes that tenant's TENANT-scoped overrides into the same flat array alongside every GLOBAL flag — distinguish scope per-row from each flag's own fields, the response doesn't pre-group them. */
export async function listFeatureFlags(tenantId?: string): Promise<ListFeatureFlagsResult> {
  const qs = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
  return adminApiFetch<ListFeatureFlagsResult>(`/v1/admin/feature-flags${qs}`);
}

export interface UpsertFeatureFlagInput {
  /** 1-100 chars, lowercase snake_case or dot.separated — e.g. `ai_flow_generation` or `module.client.beta`. */
  key: string;
  scope: FeatureFlagScope;
  /** Required iff `scope` is `TENANT`; must be omitted iff `GLOBAL` — enforced server-side too. */
  tenantId?: string;
  isEnabled: boolean;
  description?: string;
}

/** `PUT /admin/feature-flags` (ENG_ON_CALL only). A true upsert keyed on (key, scope, tenantId) — the same call creates or updates, no separate edit path. */
export async function upsertFeatureFlag(input: UpsertFeatureFlagInput): Promise<FeatureFlag> {
  return adminApiFetch<FeatureFlag>('/v1/admin/feature-flags', { method: 'PUT', body: input });
}

/** `DELETE /admin/feature-flags/:flagId` (ENG_ON_CALL only). */
export async function deleteFeatureFlag(flagId: string): Promise<void> {
  return adminApiFetch(`/v1/admin/feature-flags/${flagId}`, { method: 'DELETE' });
}

export interface ImpersonateInput {
  tenantId: string;
  /** Omit to impersonate the tenant's OWNER — the endpoint 400s if that tenant has no OWNER user, asking for an explicit `userId` instead. */
  userId?: string;
  /** Required, 10-500 chars, freeform — written into the audit log alongside every action taken under the resulting token. */
  reason: string;
}

export interface ImpersonateResult {
  /**
   * A NORMAL tenant-kind JWT — every existing tenant route and
   * `lib/api/*` function works with it unmodified. No refresh token.
   * Hand this to `useAuth().beginImpersonation(...)`
   * (`@/lib/auth/auth-provider`) to start a real tenant session from
   * it — see that function's own comment for the full handoff.
   */
  accessToken: string;
  expiresInSeconds: number;
  impersonatedUser: AuthUser;
  impersonatedTenant: AuthTenant;
}

async function extractRouteErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Route handler didn't return JSON — fall through to the fallback.
  }
  return 'Could not start impersonation. Please try again.';
}

/**
 * `POST /admin/impersonate` (SUPPORT only — ENG_ON_CALL is deliberately
 * excluded, see BUILD_PLAN.md). Gate this action client-side to
 * `hasAnyPlatformRole(role, ['SUPPORT'])`, not just "any admin."
 *
 * Deliberately NOT routed through `adminApiFetch` — the second
 * exception in this file, for a different reason than `adminLogin`'s.
 * The resulting token has to become a real session in the TENANT app (a
 * completely separate auth stack, `@/lib/auth/*`), and that app's
 * `proxy.ts` needs a server-visible marker cookie to let the
 * impersonating admin's first request into a protected tenant route —
 * impersonation sessions have no refresh token, so there's no
 * `REFRESH_TOKEN_COOKIE_NAME` cookie for it to see the way a normal
 * tenant session has. Only a Next.js Route Handler can set that cookie
 * (`@/lib/auth/impersonation-cookie.ts`), so this goes through
 * `/api/admin/impersonate` instead of straight to the backend. Because
 * that bypasses `adminApiFetch`, the admin's own bearer token is
 * attached by hand below — the route handler has no session of its own
 * to read it from — and a dead admin session here just throws (same
 * "no retry, 401 means it's over" shape `adminApiFetch` itself uses),
 * since triggering `AdminAuthProvider`'s unauthorized handling from
 * inside a plain API function would need the same bridge wiring
 * `adminApiFetch` already has, for a call this rare.
 */
export async function impersonate(input: ImpersonateInput): Promise<ImpersonateResult> {
  const token = getAdminAccessToken();
  const response = await fetch('/api/admin/impersonate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new AdminApiError(response.status, await extractRouteErrorMessage(response));
  }
  return (await response.json()) as ImpersonateResult;
}

export interface ListImpersonationActivityParams {
  tenantId?: string;
  platformAdminId?: string;
  limit?: number;
}

export interface ListImpersonationActivityResult {
  entries: ImpersonationAuditEntry[];
}

/** `GET /admin/impersonation-activity` (SUPPORT, COMPLIANCE, ENG_ON_CALL — REVOPS is deliberately excluded, see BUILD_PLAN.md). */
export async function listImpersonationActivity(
  params: ListImpersonationActivityParams = {},
): Promise<ListImpersonationActivityResult> {
  const query = new URLSearchParams();
  if (params.tenantId) query.set('tenantId', params.tenantId);
  if (params.platformAdminId) query.set('platformAdminId', params.platformAdminId);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  const qs = query.toString();
  return adminApiFetch<ListImpersonationActivityResult>(
    `/v1/admin/impersonation-activity${qs ? `?${qs}` : ''}`,
  );
}
