'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Spinner } from '@/components/ui/spinner';
import { Sidebar } from '@/components/app/sidebar';
import { AppTopbar } from '@/components/app/topbar';
import { CommandPalette } from '@/components/app/command-palette';
import { ImpersonationBanner } from '@/components/app/impersonation-banner';

export interface AppLayoutProps {
  children: ReactNode;
}

/**
 * `proxy.ts` already redirects an unauthenticated request away before
 * it gets here in the common case — this is the client-side backup for
 * the cases its cookie-presence-only check can't catch (a cookie that
 * exists but the backend then rejects during the real
 * bootstrap-refresh). Also the loading gate: nothing under here
 * renders until AuthProvider has actually resolved a session, so
 * `useAuth()`'s `user`/`tenant` can be trusted non-null anywhere below
 * this layout.
 *
 * `QueryProvider` is mounted here, not the root layout — see its own
 * comment for why. Mobile sidebar state and command-palette state are
 * both lifted here (their common ancestor with AppTopbar, which
 * triggers both) rather than each managing its own open state via a
 * side channel.
 *
 * The redirect target on `status` flipping `'unauthenticated'` branches
 * on `isImpersonating` — a dead IMPERSONATION session (ended via the
 * banner's "End impersonation", or involuntarily on a 401 with no
 * refresh path to retry, see `AuthProvider`'s `bridgeRefresh`) has no
 * tenant credentials to log back in with, so it belongs at
 * `/admin/login`, not the tenant `/login` a real session's end sends it
 * to. This is the one place that redirect decision is made — see
 * `isImpersonating`'s own doc comment on `AuthContextValue` for why it
 * deliberately outlives `clearSession` long enough for this effect to
 * still see it.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const { status, isImpersonating } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(isImpersonating ? '/admin/login' : '/login');
    }
  }, [status, isImpersonating, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" label="Loading your account" />
      </div>
    );
  }

  return (
    <QueryProvider>
      {isImpersonating ? <ImpersonationBanner /> : null}
      <div className="flex min-h-dvh">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => {
            setMobileNavOpen(false);
          }}
        />
        <div className="flex flex-1 flex-col">
          <AppTopbar
            onMobileMenuClick={() => {
              setMobileNavOpen(true);
            }}
            onSearchClick={() => {
              setCommandPaletteOpen(true);
            }}
          />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </QueryProvider>
  );
}
