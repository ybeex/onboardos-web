import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/lib/admin-auth/admin-auth-provider';

export const metadata: Metadata = {
  title: { default: 'Platform Admin', template: '%s | OnboardOS Admin' },
  robots: { index: false, follow: false },
};

export interface AdminRootLayoutProps {
  children: ReactNode;
}

/**
 * Wraps the ENTIRE `/admin/*` tree, including `/admin/login` — this is
 * the one and only place `AdminAuthProvider` is mounted, deliberately
 * nested here rather than at the root `src/app/layout.tsx`, which
 * mounts the tenant `AuthProvider` for literally everything else
 * (marketing, `(auth)`, `(app)`). Keeping `AdminAuthProvider` scoped to
 * this subtree — rather than, say, also wrapping the whole app "just in
 * case" — is itself part of keeping the two identity spaces genuinely
 * separate (BUILD_PLAN.md Section 4): nothing outside `/admin/*` can
 * call `useAdminAuth()`, and nothing in here is tempted to reach for
 * the tenant `useAuth()` instead.
 *
 * No guard and no shell here — both belong to `(dashboard)/layout.tsx`
 * below, which wraps every admin page EXCEPT login. `/admin/login`
 * itself needs neither: it's reachable precisely when there's no
 * session yet.
 *
 * `robots: { index: false }` keeps this whole surface out of search
 * results — an internal tool has no reason to be publicly discoverable,
 * unlike every marketing route this project otherwise optimizes for SEO.
 */
export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
