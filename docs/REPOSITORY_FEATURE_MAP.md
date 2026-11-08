# Repository Feature Map and Branching Workflow

## Branch flow

- `main` is the production branch. Merge only `staging` into `main`.
- `staging` is the release-candidate branch. Merge only `dev` into `staging`.
- `dev` is the integration branch. Merge feature branches into `dev` by pull request.
- Create every feature branch from the latest `dev` and open its pull request against `dev`.
- Use short-lived names such as `feat/<feature>`, `fix/<issue>`,
  `chore/<task>`, and `docs/<topic>`.
- Keep each commit focused on one coherent change and use Conventional Commits
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, or `test:`). Split unrelated
  work instead of making a catch-all commit.

## Feature branches and file ownership

Each branch below is intended to contain one focused commit. The paths are
relative to the repository root.

| Branch | Commit scope | Files |
| --- | --- | --- |
| `chore/project-foundation` | Tooling, dependencies, environment template | `.env.example`, `.gitignore`, `.prettierignore`, `.prettierrc.json`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `tsconfig.json` |
| `docs/feature-map` | Product and implementation documentation | `BUILD_PLAN.md`, `docs/*`, `docs/REPOSITORY_FEATURE_MAP.md` |
| `feat/ui-foundation` | Shared tokens, primitives, themes, and common utilities | `src/app/globals.css`, `src/components/ui/*`, `src/components/page-transition.tsx`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `src/components/providers/query-provider.tsx`, `src/lib/motion.ts`, `src/lib/utils.ts` |
| `feat/app-shell` | Root layout, app navigation, dashboard, and settings shell | `src/app/layout.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/settings/page.tsx`, `src/components/app/coming-soon.tsx`, `command-palette.tsx`, `sidebar.tsx`, `stat-card.tsx`, `topbar.tsx` |
| `feat/authentication-ui` | Tenant login and signup experience | `src/app/(auth)/*`, `src/components/auth/*`, `src/lib/auth/auth-provider.tsx`, `src/lib/auth/password-policy.ts`, `src/types/auth.ts` |
| `feat/auth-session-api` | Auth session lifecycle and route handlers | `src/app/api/auth/*`, `src/lib/api/auth-bridge.ts`, `src/lib/auth/backend-auth.ts`, `src/lib/auth/constants.ts`, `src/lib/auth/session.ts`, `src/proxy.ts` |
| `feat/api-client` | Shared backend API transport | `src/lib/api/client.ts` |
| `feat/marketing-site` | Marketing homepage, modules, and shared site chrome | `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/app/(marketing)/modules/*`, `src/components/marketing/container.tsx`, `flow-generation-showcase.tsx`, `module-card.tsx`, `section-heading.tsx`, `site-footer.tsx`, `site-header.tsx`, `step-badge-list.tsx`, `step-tracker.tsx`, `src/lib/marketing/modules.ts` |
| `feat/marketing-content` | About, contact, FAQ, how-it-works, pricing, and legal pages | `src/app/(marketing)/about/*`, `contact/*`, `faq/*`, `how-it-works/*`, `legal/*`, `pricing/*`, `src/app/api/contact/route.ts`, `src/components/marketing/contact-form.tsx`, `src/components/marketing/legal-document.tsx` |
| `feat/seo-metadata` | App icons, PWA metadata, indexing, and social image | `src/app/apple-icon.tsx`, `src/app/icon.svg`, `src/app/manifest.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/(marketing)/opengraph-image.tsx` |
| `feat/entities` | Entity list, creation, details, and API types | `src/app/(app)/entities/*`, `src/components/entities/*`, `src/lib/api/entities.ts`, `src/lib/entities/*`, `src/types/entity.ts` |
| `feat/flow-management` | Flow list/details, status, triggers, and API types | `src/app/(app)/flows/page.tsx`, `src/app/(app)/flows/[flowId]/page.tsx`, `src/app/(app)/flows/new/page.tsx`, `src/components/flows/flow-detail-view.tsx`, `flow-status-badge.tsx`, `step-summary-card.tsx`, `triggers-section.tsx`, `src/lib/api/flows.ts`, `triggers.ts`, `src/lib/flows/labels.ts`, `query-keys.ts`, `step-type-display.ts`, `src/types/flow.ts`, `src/types/enums.ts` |
| `feat/flow-builder` | Visual flow editing and step configuration | `src/app/(app)/flows/[flowId]/edit/*`, `src/components/flows/builder/*`, `src/lib/flows/format-condition.ts`, `src/lib/flows/generate-key.ts` |
| `feat/ai-flow-drafting` | AI-assisted flow draft generation and review | `src/app/(app)/flows/generate/*`, `src/components/flows/drafting/*`, `src/lib/api/flow-drafts.ts`, `src/types/flow-draft.ts` |
| `feat/enrollment-management` | Enrollment list, start, detail, and domain API | `src/app/(app)/enrollments/*` except `src/app/(app)/enrollments/[enrollmentId]/page.tsx`, `src/components/enrollments/enrollments-list-view.tsx`, `enrollment-detail-view.tsx`, `enrollment-status-badge.tsx`, `start-enrollment-form.tsx`, `src/lib/api/enrollments.ts`, `src/lib/enrollments/*`, `src/types/enrollment.ts` |
| `feat/enrollment-execution` | Step actions and execution timeline | `src/app/(app)/enrollments/[enrollmentId]/page.tsx`, `src/components/enrollments/step-action-panel.tsx`, `step-actions/*`, `step-execution-status-badge.tsx`, `step-execution-timeline.tsx` |
| `feat/verification` | Verification session views and API types | `src/app/(app)/verification/*`, `src/components/verification/*`, `src/lib/api/verification.ts`, `src/lib/verification/*`, `src/types/verification.ts` |
| `feat/admin-authentication` | Platform admin login and access provider | `src/app/admin/layout.tsx`, `src/app/admin/login/*`, `src/app/admin/(dashboard)/layout.tsx`, `src/components/admin-auth/*`, `src/lib/admin-auth/*`, `src/lib/api/admin-auth-bridge.ts` |
| `feat/platform-admin` | Tenant health, feature flags, and admin activity | `src/app/admin/(dashboard)/*` except `layout.tsx`, `src/components/admin/*`, `src/lib/admin/*`, `src/lib/api/admin.ts`, `src/lib/api/admin-client.ts`, `src/types/admin.ts` |
| `feat/admin-impersonation` | Admin tenant impersonation flow | `src/app/api/admin/impersonate/route.ts`, `src/components/app/impersonation-banner.tsx`, `src/lib/auth/impersonation-cookie.ts` |
| `feat/sentry-observability` | Runtime error reporting and error boundaries | `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/sentry.edge.config.ts`, `src/sentry.server.config.ts`, `src/app/error.tsx`, `src/app/(app)/error.tsx`, `src/app/admin/(dashboard)/error.tsx` |

## Environment and generated files

Commit `.env.example` as a placeholder-only template. Never commit `.env`,
local environment files, `.next/`, `node_modules/`, `next-env.d.ts`, or
TypeScript build-info files.
