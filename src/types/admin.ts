import type { PlatformAdminRole, FeatureFlagScope, Module } from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * Verified against the real backend source for Milestone 9
 * (src/modules/platform-admin/*.{routes,schemas,service}.ts,
 * db/schema/platform-admin.schema.ts, db/schema/feature-flags.schema.ts)
 * — see BUILD_PLAN.md Section 4's Super Admin Dashboard block for the
 * full verified contract, including which role is allowed on which
 * route. Platform admins are a completely separate identity space from
 * tenant users (`AuthUser`/`AuthTenant` in `@/types/auth`) — no shared
 * session, no shared token, enforced on the backend by a discriminated
 * JWT `kind` field that neither guard accepts from the other. Nothing
 * here should ever be mixed with the tenant auth types.
 */

/** `GET /admin/auth/me`, and the `admin` field of `POST /admin/auth/login`'s response. `passwordHash` is never sent — omitted server-side, not just unused here. */
export interface PlatformAdmin {
  id: string;
  email: string;
  fullName: string;
  role: PlatformAdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `featureFlagSchema` — `GET/PUT /admin/feature-flags`, `DELETE /admin/feature-flags/:flagId`. */
export interface FeatureFlag {
  id: string;
  key: string;
  scope: FeatureFlagScope;
  /** Set iff `scope` is `TENANT`; always `null` for `GLOBAL`. */
  tenantId: string | null;
  isEnabled: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * `tenantHealthSummarySchema` — the row shape for both
 * `GET /admin/tenants` (a list of these) and `GET /admin/tenants/:id`
 * (a single one). The backend returns the identical shape for both
 * endpoints — there is no richer per-tenant drill-down (no user list,
 * no flow list) beyond these counts, so this one type covers the list
 * row and the "detail" page honestly, without implying more detail
 * exists than the API actually provides.
 */
export interface TenantHealthSummary {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  activeModules: Module[];
  userCount: number;
  flowCount: number;
  entityCount: number;
  activeEnrollmentCount: number;
  createdAt: string;
}

/**
 * `impersonationAuditEntrySchema` — a RAW `audit_log` row, not a
 * purpose-built DTO (there is no separate impersonation-sessions
 * table). `GET /admin/impersonation-activity` surfaces both the
 * `platform_admin.impersonation_started` entry (its `metadata` carries
 * `reason` and `impersonatedRoles`) and every subsequent
 * `platform_admin.impersonated_request` entry a global audit hook
 * writes for each request made under that grant, in one list.
 *
 * `metadata` is a JSON-ENCODED STRING, not an object — the backend
 * keeps it a raw string deliberately (see the schema's own comment);
 * parse it defensively (`parseAuditMetadata` below), never assume it's
 * well-formed JSON describing a known shape, since `action` determines
 * what's actually inside and this type doesn't attempt to model every
 * variant.
 */
export interface ImpersonationAuditEntry {
  id: string;
  action: string;
  tenantId: string | null;
  actorPlatformAdminId: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: string | null;
  createdAt: string;
}

/** Defensive parse for `ImpersonationAuditEntry.metadata` — malformed or absent JSON degrades to `null` rather than throwing while rendering an activity list. */
export function parseAuditMetadata(entry: ImpersonationAuditEntry): Record<string, unknown> | null {
  if (!entry.metadata) return null;
  try {
    const parsed: unknown = JSON.parse(entry.metadata);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
