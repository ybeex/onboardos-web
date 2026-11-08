import { setRefreshTokenCookie } from '@/lib/auth/session';
import type { AuthUser, AuthTenant, SessionBootstrapResponse } from '@/types/auth';

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

interface BackendLoginOrSignupResponse {
  user: AuthUser;
  tenant: AuthTenant;
  tokens: BackendTokens;
}

/**
 * `/v1/auth/refresh`'s own response — has no `user`/`tenant` (Section
 * 4), and verified against the real backend to nest its tokens under
 * `tokens` exactly like login/signup does, NOT flattened to the top
 * level. Getting this wrong doesn't fail loudly: `refreshResult.data`
 * would silently have `refreshToken`/`accessToken`/`expiresInSeconds`
 * all `undefined` (TypeScript narrows through the generic without
 * checking the real runtime shape), so every refreshed session would
 * carry bad tokens rather than erroring — this is the single
 * highest-severity bug found while verifying this file against the
 * real backend source.
 */
interface BackendRefreshResponse {
  tokens: BackendTokens;
}

interface BackendMeResponse {
  user: AuthUser;
  tenant: AuthTenant;
}

type BackendCallResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Backend didn't return JSON — fall through to the fallback.
  }
  return fallback;
}

interface BackendCallInit {
  method: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
}

/**
 * Low-level: call one onboardos-backend JSON endpoint, handling
 * network failure and non-ok responses uniformly. Not exported — every
 * real auth flow goes through `authenticateWithBackend` or
 * `refreshWithBackend` below, which know each endpoint's actual shape.
 *
 * Takes a narrow `BackendCallInit`, not `RequestInit` — RequestInit's
 * `headers` field can structurally be a `Headers` instance or a
 * `string[][]`, neither of which spreads into an object literal the
 * way `{ ...headers }` below assumes (an array spreads into numeric
 * index keys, not the header entries). Every real call site here only
 * ever passes a plain object, so the signature says that directly
 * instead of accepting a wider type this function doesn't actually
 * handle correctly.
 */
async function callBackend<T>(path: string, init: BackendCallInit): Promise<BackendCallResult<T>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('[auth] NEXT_PUBLIC_API_URL is not configured');
    return { ok: false, status: 500, message: 'Server misconfiguration.' };
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: init.method,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      ...(init.body !== undefined ? { body: init.body } : {}),
    });
  } catch {
    return { ok: false, status: 502, message: 'Could not reach the server. Please try again.' };
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response, 'Something went wrong. Please try again.');
    return { ok: false, status: response.status, message };
  }

  const data = (await response.json()) as T;
  return { ok: true, data };
}

export type AuthProxyResult =
  { ok: true; data: SessionBootstrapResponse } | { ok: false; status: number; message: string };

/** Login or signup — both return the identical `{ user, tenant, tokens }` shape per Section 4. */
export async function authenticateWithBackend(
  path: '/v1/auth/login' | '/v1/auth/signup',
  body: unknown,
): Promise<AuthProxyResult> {
  const result = await callBackend<BackendLoginOrSignupResponse>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!result.ok) return result;

  await setRefreshTokenCookie(result.data.tokens.refreshToken);

  return {
    ok: true,
    data: {
      user: result.data.user,
      tenant: result.data.tenant,
      accessToken: result.data.tokens.accessToken,
      expiresInSeconds: result.data.tokens.expiresInSeconds,
    },
  };
}

/**
 * Rotates the refresh token, then fetches `/auth/me` for user+tenant —
 * `/auth/refresh` alone doesn't return them (see BackendRefreshResponse
 * above). This normalizes the two-call result back into the same
 * SessionBootstrapResponse shape `authenticateWithBackend` produces
 * from a single call, so AuthProvider's client-side code never needs
 * to know refresh is different underneath.
 */
export async function refreshWithBackend(refreshToken: string): Promise<AuthProxyResult> {
  const refreshResult = await callBackend<BackendRefreshResponse>('/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  if (!refreshResult.ok) return refreshResult;

  await setRefreshTokenCookie(refreshResult.data.tokens.refreshToken);

  const meResult = await callBackend<BackendMeResponse>('/v1/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${refreshResult.data.tokens.accessToken}` },
  });
  if (!meResult.ok) return meResult;

  return {
    ok: true,
    data: {
      user: meResult.data.user,
      tenant: meResult.data.tenant,
      accessToken: refreshResult.data.tokens.accessToken,
      expiresInSeconds: refreshResult.data.tokens.expiresInSeconds,
    },
  };
}
