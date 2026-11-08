import * as Sentry from '@sentry/nextjs';

/**
 * Loaded by `instrumentation.ts`'s `register()` on the Edge runtime —
 * the runtime `src/proxy.ts` itself executes on, so this is what
 * would catch an unhandled error inside the redirect logic there. See
 * `sentry.server.config.ts` for why `NEXT_PUBLIC_SENTRY_DSN` is the
 * right env var to reuse here too, and why an unset DSN is a safe,
 * documented no-op rather than a startup failure.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
