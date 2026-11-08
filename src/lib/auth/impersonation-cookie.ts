import { cookies } from 'next/headers';
import { IMPERSONATION_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * A pure presence marker for `proxy.ts`'s optimistic check — carries no
 * data, and NEVER the impersonation access token itself (that stays
 * in-memory client-side only, the same principle `session.ts` and
 * `auth-provider.tsx` already hold for every other access token in this
 * app). The only reason this cookie exists at all: an impersonation
 * session has no refresh token (verified backend contract, BUILD_PLAN.md
 * Section 4), so it has none of `REFRESH_TOKEN_COOKIE_NAME` either —
 * without SOME cookie, `proxy.ts` would see no session at all and bounce
 * an impersonating admin's very first request into a protected route
 * (e.g. `/dashboard`) straight back to `/login`, before the client-side
 * session (set via `beginImpersonation` just before that navigation) ever
 * gets a chance to render anything.
 *
 * Set by `POST /api/admin/impersonate`, cleared by
 * `DELETE /api/admin/impersonate` — see that route handler for the only
 * two places this is ever called from.
 *
 * `maxAge` matches the impersonation grant's own `expiresInSeconds`
 * rather than being a session cookie (contrast `setRefreshTokenCookie`,
 * which deliberately has no `maxAge` because the backend rotates that
 * token on every use). There is no rotation here — once the access
 * token this cookie stands in for has expired, the marker should expire
 * with it, not linger and optimistically wave a stale/reloaded tab past
 * `proxy.ts` into a session that no longer exists client-side either.
 */
export async function setImpersonationCookie(expiresInSeconds: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  });
}

export async function clearImpersonationCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE_NAME);
}
