'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Spinner } from '@/components/ui/spinner';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export interface AdminDashboardLayoutProps {
  children: ReactNode;
}

/**
 * The guard + shell for every `/admin/*` page EXCEPT login (see
 * `src/app/admin/layout.tsx`'s header comment for the split). Unlike
 * `(app)/layout.tsx`'s tenant equivalent, this is the ONLY check —
 * there is no proxy-level backup, because there is nothing server-side
 * for a proxy to check (see `src/proxy.ts`'s own comment on `/admin`
 * for exactly why: no refresh token means no cookie means no
 * server-visible signal of a platform-admin session at all). That
 * makes this effect load-bearing in a way its tenant counterpart isn't
 * — it's not a backstop for the cases an optimistic check can't catch,
 * it's the entire access control for this section.
 *
 * `status` starts `'unauthenticated'` synchronously (`AdminAuthProvider`
 * has no bootstrap/loading phase — there's nothing to bootstrap from),
 * so an unauthenticated visitor sees this spinner for only a tick
 * before the redirect fires, never a flash of real tenant-health data.
 *
 * `QueryProvider` is mounted here, not reused from `(app)`'s instance —
 * a fresh, independent `QueryClient` per the admin section, since
 * admin queries are fetched with a completely different bearer token
 * than tenant business-data queries and should never share a cache
 * with them (see `QueryProvider`'s own comment on why a lazy
 * `useState` initializer makes a second independent mount here safe).
 */
export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="flex min-h-dvh flex-col">
        <AdminTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </QueryProvider>
  );
}
