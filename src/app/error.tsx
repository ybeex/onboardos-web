'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/ui/logo-mark';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js requires `error.tsx` boundaries to be Client Components — the
 * error is caught during rendering, which can happen on either side,
 * but the recovery UI (and the `reset()` call) only make sense running
 * in the browser.
 *
 * `Sentry.captureException` was formerly a documented, deliberate gap
 * here (see README's former "Known gaps" entry) — wiring a real
 * provider was real infrastructure work belonging to its own pass, not
 * something to silently bolt on inside a page component. That pass has
 * now happened (`src/instrumentation.ts` + `sentry.*.config.ts`); this
 * is a no-op until `NEXT_PUBLIC_SENTRY_DSN` is actually set (see those
 * files), so there's nothing unsafe about calling it unconditionally.
 * The `console.error` stays alongside it, not replaced by it — still
 * the only signal in local dev with no DSN configured.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoMark className="text-destructive h-12 w-12" decorative={false} />
      <div className="space-y-2">
        <h1 className="font-display text-foreground text-3xl font-bold sm:text-4xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md">
          An unexpected error interrupted this page. It&apos;s been logged — trying again usually
          resolves it.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">Reference: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
