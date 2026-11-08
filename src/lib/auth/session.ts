import { cookies } from 'next/headers';
import { REFRESH_TOKEN_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * The refresh token is set here verbatim, exactly as the backend
 * issues it — see .env.example's note: it's the backend's own opaque,
 * high-entropy, server-hashed bearer token, not a JWT with a
 * client-readable payload, so there's nothing for this app to encrypt
 * or sign beyond what httpOnly + Secure + SameSite already provide.
 *
 * No fixed `maxAge` is set (a session cookie) — the backend is the
 * source of truth on the token's own lifetime; this cookie simply
 * carries whatever it's given for as long as the browser session
 * lasts, and `/api/auth/refresh` rotates it on every use per Section 4.
 */
export async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
}

export async function clearRefreshTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}
