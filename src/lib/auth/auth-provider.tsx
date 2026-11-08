'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, AuthTenant, SessionBootstrapResponse } from '@/types/auth';
import { registerAuthBridge } from '@/lib/api/auth-bridge';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface LoginInput {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface SignupInput {
  tenantName: string;
  tenantSlug: string;
  fullName: string;
  email: string;
  password: string;
  initialModules: string[];
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  tenant: AuthTenant | null;
  /** In memory only — never written to localStorage/sessionStorage. See BUILD_PLAN.md Section 3's architecture decision. */
  accessToken: string | null;
  /**
   * True from `beginImpersonation` until the next real `login`/`signup`
   * — see that function's own comment for why this deliberately does
   * NOT reset when the session ends (`clearSession`), only when a new
   * one begins.
   */
  isImpersonating: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Starts a real tenant session from a platform admin's impersonation grant. See its own comment below for the full handoff this is one half of. */
  beginImpersonation: (data: SessionBootstrapResponse) => void;
  /** Ends an impersonation session. See its own comment below. */
  endImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Route handler didn't return JSON — fall through to the fallback.
  }
  return fallback;
}

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Mounted once at the root layout, wrapping the whole app (see
 * layout.tsx) — marketing pages don't need it, but a single instance
 * here is simpler and cheaper than scoping it per route group, and
 * every route group that DOES need it (auth, the app shell) can rely
 * on it always being present.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const applySession = useCallback((data: SessionBootstrapResponse) => {
    setUser(data.user);
    setTenant(data.tenant);
    setAccessToken(data.accessToken);
    setStatus('authenticated');
  }, []);

  // Deliberately does NOT reset `isImpersonating` — see that field's own
  // doc comment on AuthContextValue. `(app)/layout.tsx`'s redirect
  // effect reads it at the moment `status` flips to `unauthenticated` to
  // decide whether to send the browser to `/login` (a real session
  // ending) or `/admin/login` (an impersonation session ending,
  // voluntarily via `endImpersonation` or involuntarily via a 401 with
  // no refresh path to retry) — if this reset the flag too, that
  // decision would always see `false` and send an impersonating admin
  // to a tenant login page they have no tenant credentials for. Only
  // `login`/`signup`/`beginImpersonation` — the three ways a session can
  // actually BEGIN — touch it.
  const clearSession = useCallback(() => {
    setUser(null);
    setTenant(null);
    setAccessToken(null);
    setStatus('unauthenticated');
  }, []);

  // The one place that actually calls /api/auth/refresh — used both
  // for the bootstrap-on-load effect below (fire-and-forget on mount)
  // and exposed to lib/api/client.ts via the bridge (called on-demand
  // when a business API call gets a 401), so there's exactly one
  // implementation of "what does a refresh actually do" rather than
  // two copies that could drift.
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!response.ok) {
        clearSession();
        return null;
      }
      const data = (await response.json()) as SessionBootstrapResponse;
      applySession(data);
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  // Bootstrap-on-load: silently restore a session from the httpOnly
  // refresh cookie, if any, so a returning user with a still-valid
  // cookie doesn't have to sign in again after a page reload.
  //
  // No cancellation guard for an unmount mid-request — that pattern
  // guards against calling a state setter after unmount, which was a
  // real problem (a console warning) through React 17. React 18+
  // (this project is on 19.2) already makes that a harmless no-op, so
  // the guard would only be adding complexity to prevent something
  // that no longer causes an issue.
  useEffect(() => {
    void (async () => {
      await refreshAccessToken();
    })();
  }, [refreshAccessToken]);

  // The function actually registered with the bridge is NOT
  // `refreshAccessToken` directly whenever `isImpersonating` — an
  // impersonation session has no refresh token, so `/api/auth/refresh`
  // would either cleanly fail (no cookie, the common case: `clearSession`
  // fires, same end state as today) or, in the rarer case where this
  // same browser happens to ALSO hold a real tenant refresh cookie from
  // some unrelated normal login, silently succeed and swap the admin
  // into THEIR OWN tenant session mid-impersonation — confusing at best,
  // since the banner would keep claiming an impersonation that's no
  // longer actually active. Short-circuiting straight to `clearSession`
  // instead makes a dead impersonation session end the same deliberate,
  // no-retry way a dead admin session already does (see
  // `admin-auth-provider.tsx`), rather than leaving its fate to whatever
  // cookies happen to be lying around in this browser.
  const bridgeRefresh = useCallback(async (): Promise<string | null> => {
    if (isImpersonating) {
      clearSession();
      return null;
    }
    return refreshAccessToken();
  }, [isImpersonating, refreshAccessToken, clearSession]);

  // Keeps lib/api/client.ts's module-level bridge in sync with the
  // current token, and gives it a way to trigger a real refresh on a
  // 401 without being a hook itself. See auth-bridge.ts's own comment.
  useEffect(() => {
    registerAuthBridge(accessToken, bridgeRefresh);
  }, [accessToken, bridgeRefresh]);

  const login = useCallback(
    async (input: LoginInput): Promise<void> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(
          await extractErrorMessage(response, 'Could not sign in. Please try again.'),
        );
      }
      setIsImpersonating(false);
      applySession((await response.json()) as SessionBootstrapResponse);
    },
    [applySession],
  );

  const signup = useCallback(
    async (input: SignupInput): Promise<void> => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(
          await extractErrorMessage(response, 'Could not create your account. Please try again.'),
        );
      }
      setIsImpersonating(false);
      applySession((await response.json()) as SessionBootstrapResponse);
    },
    [applySession],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // One half of the impersonation handoff — the other half is
  // `tenant-health-detail-view.tsx`'s impersonate form, which is the
  // ONLY place in the admin UI that reaches across into this TENANT
  // auth stack (a deliberate, narrow, documented exception to the two
  // stacks' otherwise strict separation; see that component's own
  // comment). `ImpersonateResult` and `SessionBootstrapResponse` are
  // structurally identical (id/email/fullName/roles for the user,
  // id/name/slug/activeModules for the tenant, plus accessToken +
  // expiresInSeconds) — the caller maps field names
  // (impersonatedUser/impersonatedTenant → user/tenant) and passes the
  // result straight in. This reuses `applySession` as-is: an
  // impersonation session and a normal one look identical to the rest
  // of this provider and to `lib/api/client.ts` downstream, EXCEPT for
  // the `isImpersonating` flag this also sets, which changes two
  // things: `bridgeRefresh` above skips the (meaningless, for this
  // session) real refresh attempt on a 401, and `(app)/layout.tsx`
  // renders the persistent banner and redirects to `/admin/login`
  // rather than `/login` once the session ends.
  //
  // Deliberately takes the already-fetched result as a plain argument
  // rather than calling `impersonate()` itself — that call needs the
  // ADMIN bearer token (`@/lib/api/admin`'s concern, a different auth
  // stack entirely), and belongs in the admin-side component that
  // already has it, not duplicated or reached for from here.
  const beginImpersonation = useCallback(
    (data: SessionBootstrapResponse): void => {
      applySession(data);
      setIsImpersonating(true);
    },
    [applySession],
  );

  // Clears the one server-visible trace of the impersonation session
  // (the marker cookie `proxy.ts` checks — see
  // `impersonation-cookie.ts`) and then the in-memory session, mirroring
  // `logout`'s own best-effort shape: try the server-side cleanup, clear
  // local state regardless of whether it succeeded. Deliberately calls
  // `/api/admin/impersonate` (DELETE), not `/api/auth/logout` — the
  // latter targets the real refresh-cookie flow this session never had,
  // and would silently no-op on the one cookie this flow actually needs
  // cleared.
  const endImpersonation = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' });
    } catch {
      // Best-effort — the in-memory session is cleared below regardless.
    }
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        tenant,
        accessToken,
        isImpersonating,
        login,
        signup,
        logout,
        beginImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
