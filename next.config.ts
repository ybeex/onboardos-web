import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

/**
 * `output: 'standalone'` mirrors the backend's own containerization
 * story (see onboardos-backend's SERVICES.md) — produces a minimal,
 * self-contained build for Docker/Render/Fly.io deployment rather than
 * requiring a full node_modules copy at deploy time.
 *
 * `typedRoutes` catches an invalid `href`/`router.push()` target at
 * build time instead of a runtime 404 — meaningful here given how many
 * distinct route surfaces this app has (marketing, auth, tenant app,
 * platform-admin).
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    // No remote image sources yet — every visual asset (logo, marks,
    // illustrations) is authored as an inline SVG component, not a
    // fetched image. Extend this only when a real remote source
    // (e.g. user-uploaded avatars) is actually wired up.
    remotePatterns: [],
  },
  experimental: {
    // lucide-react's module entry point is one ~1600-icon barrel file
    // (checked: dist/esm/lucide-react.js re-exports every icon from a
    // single index). sideEffects: false in its package.json lets a
    // bundler tree-shake that down to just the icons actually
    // imported, but this rewrites each `import { X } from
    // 'lucide-react'` to import directly from X's own module instead —
    // faster and more reliable than leaning on the minifier to prune
    // ~1600 re-exports. Kept explicit even though Next.js already
    // defaults lucide-react into this list (checked
    // node_modules/next/dist/server/config.js), so the optimization
    // doesn't silently disappear if that default list ever changes
    // upstream. sonner (this app's other UI dependency that could look
    // like a candidate) was checked too: its package.json exports map
    // has a single "." entry with no subpaths, so there's no barrel
    // for this to unwrap — toast/Toaster already tree-shake normally.
    optimizePackageImports: ['lucide-react'],
  },
};

/**
 * `org`/`project`/`authToken` all come from env vars rather than
 * hardcoded placeholders, so activating Sentry is a config-only
 * change, never a code edit. `SENTRY_AUTH_TOKEN` is a real build-time
 * secret used only for sourcemap upload and is deliberately NOT
 * prefixed `NEXT_PUBLIC_`, unlike the DSN the two config files above
 * use (see `.env.example`) — it never ships to the browser. All three
 * are genuinely optional here — Sentry's build tooling is designed to
 * skip the sourcemap-upload step rather than fail the build when no
 * auth token is present, so a clone with no Sentry project configured
 * yet still builds exactly as it did before this wrapper was added —
 * but `SentryBuildOptions`' own fields are typed as plain `string`,
 * not `string | undefined` (confirmed by `tsc` itself: passing
 * `org: process.env.SENTRY_ORG` directly fails under this project's
 * `exactOptionalPropertyTypes`). Conditionally spreading each one
 * keeps the key itself absent rather than present-with-`undefined`,
 * the same pattern already used for optional fields in
 * `lib/api/client.ts` and elsewhere in this codebase. `silent:
 * !process.env.CI` matches Sentry's own documented default: quiet
 * locally, verbose where the upload actually runs and matters.
 */
export default withSentryConfig(nextConfig, {
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),
  silent: !process.env.CI,
});
