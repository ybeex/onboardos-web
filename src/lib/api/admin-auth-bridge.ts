/**
 * The admin-side mirror of `auth-bridge.ts` — a separate module-level
 * pair of variables, never the tenant ones. Platform-admin and tenant
 * sessions are two completely separate identity spaces on the real
 * backend (a discriminated JWT `kind`, each guard rejecting the other's
 * token by construction — see BUILD_PLAN.md Section 4's Super Admin
 * Dashboard block), and keeping two distinct bridge modules is what
 * makes mixing them a compile-time impossibility on this side too:
 * `admin-client.ts` can only ever read `currentAdminAccessToken`, never
 * the tenant one.
 *
 * The shape differs from the tenant bridge in exactly the way the real
 * backend contract differs: platform-admin sessions have no refresh
 * token at all, so there's nothing for `admin-client.ts` to trigger on
 * a 401 except "this session is dead." Rather than scattering
 * `if (status === 401) logout()` across every component that calls an
 * admin endpoint, that single reaction is centralized here exactly the
 * way the tenant bridge centralizes refresh-on-401: `admin-client.ts`
 * calls `notifyAdminUnauthorized()` once, in one place, and
 * `AdminAuthProvider` (the only writer) is the one that actually clears
 * its session state, the same ownership split the tenant pair uses.
 */

let currentAdminAccessToken: string | null = null;
let currentOnUnauthorized: (() => void) | null = null;

export function registerAdminAuthBridge(
  accessToken: string | null,
  onUnauthorized: () => void,
): void {
  currentAdminAccessToken = accessToken;
  currentOnUnauthorized = onUnauthorized;
}

export function getAdminAccessToken(): string | null {
  return currentAdminAccessToken;
}

/** Called by `admin-client.ts` on a 401 — triggers `AdminAuthProvider`'s real session-clearing logic without `admin-client.ts` needing to be a hook itself. */
export function notifyAdminUnauthorized(): void {
  currentOnUnauthorized?.();
}
