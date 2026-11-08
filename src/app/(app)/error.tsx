'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { Button, buttonVariants } from '@/components/ui/button';
import { LogoMark } from '@/components/ui/logo-mark';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Scoped to the `(app)` route group, not just relying on the root
 * `src/app/error.tsx`. An `error.tsx` boundary wraps its own folder's
 * `{children}` slot but not the sibling `layout.tsx` in that folder —
 * so the root boundary, being a sibling of the root layout, catches an
 * error anywhere below it by replacing everything the root layout's
 * `{children}` contains, which is `(app)/layout.tsx` in its entirety:
 * Sidebar, AppTopbar, and all. A person mid-task who hits a rendering
 * bug on one page would lose all navigation chrome along with it, left
 * with nothing but a full-page apology and a hard reload.
 *
 * Placed here instead, this boundary sits inside `(app)/layout.tsx`'s
 * own `{children}` slot — it only replaces what `<main>` renders.
 * Sidebar and AppTopbar are part of the layout's own output, not of
 * `{children}`, so they stay mounted and interactive even while this
 * fallback is showing, which is what makes "back to dashboard" below a
 * real second option rather than a redundant one.
 */
export default function AppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <LogoMark className="text-destructive h-12 w-12" decorative={false} />
      <div className="space-y-2">
        <h1 className="font-display text-foreground text-2xl font-bold sm:text-3xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md">
          This page ran into an unexpected error. It&apos;s been logged — trying again usually
          resolves it.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">Reference: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
