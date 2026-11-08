/**
 * Deliberately the only export in this file, with zero other imports.
 * `proxy.ts` reads cookies via `NextRequest`'s own `request.cookies`
 * API, a different surface entirely from `next/headers`' ambient
 * `cookies()` that `session.ts` uses (which needs a request-scoped
 * context Proxy doesn't have) — importing the name from `session.ts`
 * instead would pull that unrelated, inapplicable import in along
 * with it for no reason. `session.ts` imports this constant too, so
 * the two never drift on the actual cookie name.
 */
export const REFRESH_TOKEN_COOKIE_NAME = 'ob_refresh_token';

/**
 * A pure presence marker, not a token — see
 * `@/lib/auth/impersonation-cookie.ts` for what it carries (nothing)
 * and why it exists at all (so `proxy.ts` has something server-visible
 * to check for an impersonation session, which — unlike a normal
 * tenant session — has no refresh token and therefore none of
 * `REFRESH_TOKEN_COOKIE_NAME` either).
 */
export const IMPERSONATION_COOKIE_NAME = 'ob_impersonation_active';
