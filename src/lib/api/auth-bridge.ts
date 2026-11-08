/**
 * A tiny bridge between AuthProvider's React state (the actual source
 * of truth for the current access token) and the plain, standalone API
 * client functions in this directory. Those functions need to read
 * the current token without being hooks themselves — TanStack Query's
 * `queryFn` works most naturally as a plain async function, not one
 * that calls `useAuth()` itself.
 *
 * AuthProvider is the only writer (see its own `useEffect` syncing
 * this on every `accessToken` change, and its `refreshAccessToken`
 * being registered here so `client.ts` can trigger a real refresh on a
 * 401 without needing to be a hook). Every API client function is a
 * reader.
 */

let currentAccessToken: string | null = null;
let currentRefreshFn: (() => Promise<string | null>) | null = null;

export function registerAuthBridge(
  accessToken: string | null,
  refreshFn: () => Promise<string | null>,
): void {
  currentAccessToken = accessToken;
  currentRefreshFn = refreshFn;
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

/** Triggers AuthProvider's real refresh flow. Returns the new token, or null if refresh failed (AuthProvider will already have cleared the session in that case). */
export async function refreshAccessToken(): Promise<string | null> {
  if (!currentRefreshFn) return null;
  return currentRefreshFn();
}
