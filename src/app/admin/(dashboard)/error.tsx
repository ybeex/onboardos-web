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
 * Scoped to `admin/(dashboard)` specifically — not the outer
 * `admin/layout.tsx` — because `(dashboard)/layout.tsx` is precisely
 * where `AdminTopbar` is mounted (`admin/layout.tsx` itself is a bare
 * `AdminAuthProvider` wrapper with no shell chrome, shared with
 * `/admin/login`; see its own header comment). An `error.tsx` boundary
 * wraps its own folder's `{children}` slot but not the sibling
 * `layout.tsx`, so placing this one folder higher would still unmount
 * `AdminTopbar` on a content error — the whole dashboard layout,
 * chrome included, would sit inside that higher boundary's
 * `{children}`. Placed here, only what `(dashboard)/layout.tsx`
 * renders inside `<main>` is replaced; `AdminTopbar` stays mounted and
 * clickable, so a platform admin mid-investigation doesn't lose the
 * one way back to the rest of the tool along with the page that broke.
 */
export default function AdminError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled admin error:', error);
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
        <Link href="/admin" className={buttonVariants({ variant: 'outline' })}>
          Back to admin home
        </Link>
      </div>
    </div>
  );
}
