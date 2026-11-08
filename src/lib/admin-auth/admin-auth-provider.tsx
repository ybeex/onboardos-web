'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { PlatformAdmin } from '@/types/admin';
import type { AdminLoginInput } from '@/lib/api/admin';
import { adminLogin } from '@/lib/api/admin';
import { registerAdminAuthBridge } from '@/lib/api/admin-auth-bridge';

type AdminAuthStatus = 'unauthenticated' | 'authenticated';

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  admin: PlatformAdmin | null;
  /** In memory only — never written to localStorage/sessionStorage, same principle as the tenant provider's `accessToken` (see BUILD_PLAN.md Section 3). */
  accessToken: string | null;
  login: (input: AdminLoginInput) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * The admin-side mirror of `@/lib/auth/auth-provider.tsx`, with every
 * difference traced directly to the verified backend contract
 * (BUILD_PLAN.md Section 4's Super Admin Dashboard block):
 *
 * - **No bootstrap-on-mount restore.** The tenant provider silently
 *   restores a session from its httpOnly refresh cookie on every page
 *   load. Platform-admin sessions have no refresh token and no cookie
 *   at all, so there is nothing to restore — `status` starts
 *   `'unauthenticated'` and simply stays that way until `login()`
 *   succeeds. A hard reload of any `/admin/*` page always requires
 *   signing in again; that's the intended tradeoff documented on the
 *   backend (short-lived by design), not a gap this provider should
 *   paper over with its own persistence.
 * - **No `refreshAccessToken`.** There is nothing to refresh. A 401
 *   from `adminApiFetch` calls `clearSession` below (wired through
 *   `admin-auth-bridge.ts`'s `onUnauthorized` callback) instead of
 *   attempting a retry.
 * - **No `signup`** — there is no public signup for this identity
 *   space (`POST /admin/platform-admins` is SUPER-only and, per
 *   BUILD_PLAN.md, deliberately outside this milestone's UI).
 * - **`logout` is purely client-side.** There is no
 *   `POST /admin/auth/logout` in the verified contract — nothing
 *   server-side to invalidate, since there's no refresh token or
 *   cookie standing for the session. Forgetting the in-memory access
 *   token IS logging out.
 *
 * Mounted at `src/app/admin/layout.tsx`, wrapping the entire `/admin/*`
 * tree (including the login page) — never nested inside, and never
 * reading from, the tenant `AuthProvider` at the root layout. The two
 * are separate identity spaces on the backend (a discriminated JWT
 * `kind`); keeping separate providers, separate bridges
 * (`admin-auth-bridge.ts` vs `auth-bridge.ts`), and separate API
 * clients (`admin-client.ts` vs `client.ts`) is what keeps that
 * separation real on this side too, not just a backend guarantee this
 * app trusts blindly.
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [status, setStatus] = useState<AdminAuthStatus>('unauthenticated');
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setAdmin(null);
    setAccessToken(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    registerAdminAuthBridge(accessToken, clearSession);
  }, [accessToken, clearSession]);

  const login = useCallback(async (input: AdminLoginInput): Promise<void> => {
    const result = await adminLogin(input);
    setAdmin(result.admin);
    setAccessToken(result.accessToken);
    setStatus('authenticated');
  }, []);

  const logout = useCallback((): void => {
    clearSession();
  }, [clearSession]);

  return (
    <AdminAuthContext.Provider value={{ status, admin, accessToken, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
