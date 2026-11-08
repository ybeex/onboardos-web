import * as Sentry from '@sentry/nextjs';

/**
 * Loaded by `instrumentation.ts`'s `register()` when the Node.js
 * server starts. `NEXT_PUBLIC_SENTRY_DSN` is reused here rather than a
 * second, server-only env var — a Sentry DSN is designed to be public
 * (the same way a Stripe *publishable* key is, not a secret key; see
 * `.env.example`'s own comment on this), so there's no reason for the
 * client and server to read two different variables for the same
 * value. `Sentry.init` with `dsn: undefined` disables the SDK
 * entirely rather than throwing — this is Sentry's own documented
 * no-op behavior, not something this file has to guard for — so a
 * machine with no Sentry project configured yet still builds and runs
 * normally; it just doesn't report anything.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
