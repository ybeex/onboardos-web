import { getAccessToken, refreshAccessToken } from '@/lib/api/auth-bridge';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiFetchInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
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
 * Every business API call (Entities, Flows, Enrollments, ...) goes
 * through this. Calls onboardos-backend directly — never through a
 * Next.js Route Handler — per BUILD_PLAN.md Section 3's architecture
 * decision: only login/signup/refresh/logout proxy through the BFF;
 * everything else goes straight from the client with a bearer header,
 * to avoid proxy overhead on the bulk of app traffic.
 *
 * Attaches the token from the module-level bridge AuthProvider keeps
 * in sync (see auth-bridge.ts's own comment for why this isn't just
 * `useAuth()` inside each call), and retries exactly once through a
 * real token refresh on a 401 before giving up.
 */
export async function apiFetch<T>(path: string, init: ApiFetchInit = {}): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new ApiError(500, 'NEXT_PUBLIC_API_URL is not configured.');
  }
  // Re-bound with an explicit `string` type — narrowing from the check
  // above doesn't persist into the nested `attempt` closure below,
  // since a closure sees `apiUrl`'s declared type (`string |
  // undefined`), not the outer narrowing. This variable's declared
  // type IS `string`, so there's nothing left to narrow.
  const baseUrl: string = apiUrl;

  async function attempt(): Promise<Response> {
    const token = getAccessToken();
    return fetch(`${baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    });
  }

  let response = await attempt();

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await attempt();
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
