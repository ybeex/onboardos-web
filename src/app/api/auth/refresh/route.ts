import { NextResponse } from 'next/server';
import { getRefreshTokenCookie, clearRefreshTokenCookie } from '@/lib/auth/session';
import { refreshWithBackend } from '@/lib/auth/backend-auth';

/**
 * Called two ways: by AuthProvider's bootstrap-on-load effect (every
 * fresh page load, to silently restore a session from the httpOnly
 * cookie), and — later, once M4+ business API calls exist — whenever
 * an access token expires mid-session. No request body: the refresh
 * token comes from the cookie the browser sends automatically, never
 * from anything client JS can read or construct.
 */
export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    return NextResponse.json({ error: 'No active session.' }, { status: 401 });
  }

  const result = await refreshWithBackend(refreshToken);
  if (!result.ok) {
    // The cookie's refresh token is invalid/expired — clear it so the
    // next load doesn't keep retrying a dead session.
    await clearRefreshTokenCookie();
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
