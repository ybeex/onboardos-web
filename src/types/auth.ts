import type { TenantRole, Module } from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * Verified against the real backend (src/modules/auth/auth.schemas.ts,
 * src/db/schema/core.schema.ts) rather than reconstructed from the
 * planning docs. Two corrections from the original (pre-verification)
 * version of this file, both confirmed by reading the actual schema:
 *
 * 1. `AuthUser.roles` is an ARRAY (`TenantRole[]`), not a single
 *    `role: TenantRole`. A user can hold more than one role on a
 *    tenant; access checks take the highest rank among them (see
 *    `hasAtLeastRole` in `@/types/enums`, mirroring the backend's
 *    `rbac.ts`). Every consumer that read `.role` singular must read
 *    `.roles` and run it through `hasAtLeastRole` instead.
 * 2. `AuthTenant.activeModules` is a real field (`Module[]`) returned
 *    alongside the tenant — which modules (EMPLOYEE/PRODUCT/CLIENT/
 *    IDENTITY) this tenant has turned on. Nothing in the original
 *    version exposed this, so nothing consumed it yet; it's needed for
 *    module-gated nav/UI.
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: TenantRole[];
}

export interface AuthTenant {
  id: string;
  name: string;
  slug: string;
  activeModules: Module[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

/**
 * What every BFF auth route handler (`api/auth/login`, `/signup`,
 * `/refresh`) returns to the browser. The refresh token is
 * deliberately never included — it stays server-side in the httpOnly
 * cookie that same route handler also sets (see `lib/auth/session.ts`)
 * — this is the one shape the client ever needs to know about,
 * regardless of which backend call(s) actually produced it (see
 * `lib/auth/backend-auth.ts`'s header comment for why `/refresh`
 * needs an extra call underneath to normalize into this same shape).
 */
export interface SessionBootstrapResponse {
  user: AuthUser;
  tenant: AuthTenant;
  accessToken: string;
  expiresInSeconds: number;
}
