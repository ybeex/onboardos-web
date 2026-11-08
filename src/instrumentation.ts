import * as Sentry from '@sentry/nextjs';

/**
 * Next.js's server-startup hook — a file-convention name, resolved
 * from either the project root or `src/` (verified against Next's own
 * build source, `build/utils.js`'s `isInstrumentationHookFile`
 * checks, not assumed); this app keeps it in `src/`, the same place
 * `proxy.ts` already lives. Loads whichever Sentry init matches the
 * runtime that actually started: `sentry.server.config.ts` for the
 * Node.js server, `sentry.edge.config.ts` for Edge (where `proxy.ts`
 * runs). Both configs no-op safely with no DSN set — see their own
 * header comments — so nothing here requires a Sentry account to
 * exist for the app to build and run.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Reports an error thrown in a Server Component, a route handler, or
 * `proxy.ts` — none of which render inside any `error.tsx`'s React
 * tree, so none of those boundaries' own `Sentry.captureException`
 * calls would ever see them. This is Next.js's own recommended hook
 * for exactly that gap (`captureRequestError` is a real, exported
 * `@sentry/nextjs` function — confirmed in the installed package, not
 * assumed from docs prose).
 */
export const onRequestError = Sentry.captureRequestError;
