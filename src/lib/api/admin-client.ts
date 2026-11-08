import { getAdminAccessToken, notifyAdminUnauthorized } from '@/lib/api/admin-auth-bridge';

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

interface AdminApiFetchInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Not JSON — fall through to the generic message below.
  }
  return `Request failed with status ${String(response.status)}`;
}

/**
 * The admin-side mirror of `client.ts`, with exactly one real
 * difference, which follows directly from the verified backend
 * contract: **no refresh-and-retry on a 401**. Platform-admin sessions
 * have no refresh token at all (BUILD_PLAN.md Section 4's Super Admin
 * Dashboard block) — a 401 here always means the session is genuinely
 * over, so this notifies `AdminAuthProvider` once (via the bridge) to
 * clear its state and then throws, letting the admin layout's own
 * unauthenticated-redirect effect send the admin back to
 * `/admin/login`, rather than attempting a retry that has nothing to
 * retry with.
 *
 * Calls `onboardos-backend` directly, same as `client.ts` — there's no
 * BFF proxy for any admin route (see `admin-auth.ts`'s header comment
 * for why login specifically needs none either).
 */
export async function adminApiFetch<T>(path: string, init: AdminApiFetchInit = {}): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new AdminApiError(500, 'NEXT_PUBLIC_API_URL is not configured.');
  }

  const token = getAdminAccessToken();
  const response = await fetch(`${apiUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });

  if (response.status === 401) {
    notifyAdminUnauthorized();
    throw new AdminApiError(401, 'Your admin session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw new AdminApiError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
