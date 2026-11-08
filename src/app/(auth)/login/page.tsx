import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Spinner } from '@/components/ui/spinner';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your OnboardOS workspace.',
};

/**
 * A thin server component — metadata exports need a server component,
 * and LoginForm's use of useSearchParams() (for the post-login "next"
 * redirect target) needs a Suspense boundary so the rest of the route
 * can still prerender instead of the whole page de-opting to fully
 * dynamic. Same reasoning applies to signup/page.tsx, which doesn't
 * use useSearchParams but is split the same way for consistency and to
 * keep 'use client' scoped to only what actually needs it.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading" />}>
      <LoginForm />
    </Suspense>
  );
}
