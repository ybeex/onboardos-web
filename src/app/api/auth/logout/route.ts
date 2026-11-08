import { NextResponse } from 'next/server';
import { getRefreshTokenCookie, clearRefreshTokenCookie } from '@/lib/auth/session';

export async function POST(): Promise<NextResponse> {
  const refreshToken = await getRefreshTokenCookie();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (refreshToken && apiUrl) {
    try {
      await fetch(`${apiUrl}/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort — the cookie is cleared below regardless, so the
      // user is signed out of this app even if telling the backend to
      // revoke the token server-side fails.
    }
  }

  await clearRefreshTokenCookie();
  return NextResponse.json({ ok: true });
}
