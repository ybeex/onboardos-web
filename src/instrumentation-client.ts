import * as Sentry from '@sentry/nextjs';

/**
 * Client-side Sentry init — a file-convention name (verified against
 * Next's own `create-compiler-aliases.js`, which resolves
 * `private-next-instrumentation-client` from `src/instrumentation-
 * client` before the project-root fallback) that replaces the older
 * `sentry.client.config.ts` pattern from earlier SDK versions. Runs in
 * the browser only. See `sentry.server.config.ts` for why
 * `NEXT_PUBLIC_SENTRY_DSN` is safe to read directly here (it's
 * designed to be public) and why an unset DSN just disables
 * reporting rather than breaking anything.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

/**
 * Reports a client-side navigation failure — an App Router route
 * transition that throws before the destination page ever mounts, so
 * there's no `error.tsx` boundary in place yet to catch it any other
 * way.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
