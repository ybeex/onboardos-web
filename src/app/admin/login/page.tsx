import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin-auth/admin-login-form';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * No Suspense boundary needed — unlike the tenant login page, this form
 * doesn't read `useSearchParams()` (see `AdminLoginForm`'s header
 * comment for why there's no redirect-back target to read). The `Logo`
 * is NOT wrapped in a link to `/` the way `(auth)/layout.tsx` does for
 * the tenant pages — this surface is deliberately not an on-ramp back
 * to the public marketing site.
 */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex items-center gap-2">
        <Logo size="lg" />
        <Badge variant="neutral">Admin</Badge>
      </div>
      <AdminLoginForm />
    </div>
  );
}
