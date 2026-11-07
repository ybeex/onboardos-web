# OnboardOS Frontend

> **Before anything else, read BUILD_PLAN.md Section 0.** A session
> after Milestone 6 got real backend source access for the first time
> (previously every API fact here was reconstruction from memory) and
> found 12 concrete issues — a likely-broken auth refresh flow, an
> add-step feature in the M6 builder that fails against the real
> backend, a publish action that would corrupt the flow-detail cache,
> and more. **All 12 findings are now applied to the code in this zip
> and verified clean** (`tsc`, `eslint`, `prettier`, and a `next build`
> that gets past type-checking and bundling before hitting the
> sandbox's expected font-fetch restriction) — nothing from that
> verification pass is still open. Section 0 has the itemized list
> with each item's status and exactly what it touched, plus important
> context on five planning docs (a PRD and four companion docs) that
> describe a much more ambitious product vision than what was actually
> built — read Section 0.1 before assuming those docs describe this
> codebase's real architecture.

Marketing site, authenticated tenant app, and Super Admin Dashboard for
OnboardOS — built against `onboardos-backend`'s API (10 milestones
total, documented separately below; **all 10 — foundations through the
final hardening pass — are complete as of this writing.** This is a
feature-complete build of the full planned scope; see "Continuing this
build" if you're picking it up for further work).

> **Build provenance note:** Milestone 1 was authored in a sandboxed
> environment with no working `npm install` — every M1 file was
> hand-authored and syntax-verified via the TypeScript compiler API
> only. **That limitation did not hold in the Milestone 2 session**:
> `npm install` reached the real registry and completed (after fixing
> two stale version pins), which meant `tsc --noEmit`, real `eslint`,
> and `prettier` could all run for real for the first time — see
> BUILD_PLAN.md Section 2a for exactly what that surfaced and fixed,
> including three genuine `exactOptionalPropertyTypes` bugs in M1 code
> that the syntax-only check couldn't have caught. `next build` still
> can't fully complete in this sandbox (a Google Fonts network block,
> not a code defect — also detailed in Section 2a). **Don't assume
> either the "no npm install" or "no real build" limitation still
> applies without trying first** — this session's own experience is
> that it can change between sessions.
>
> The M1 session separately experienced three sandbox resets mid-build,
> fully recovered each time via the checkpoint discipline described
> below. The M2 session hit none, but checkpointed just as regularly
> regardless — see "Continuing this build."

## Milestone 1 — Foundation: complete

- Next.js 16.2 (App Router, Turbopack), React 19.2, TypeScript strict mode
- Tailwind CSS v4.3 — CSS-first `@theme`, zero `tailwind.config.ts`
- The full design-token system (`src/app/globals.css`) — see "Design tokens" below
- next-themes — system-aware light/dark/system, no-flash SSR, class-based
- Motion (the Framer Motion successor) — soft page transitions, branded spinner, reduced-motion handling throughout
- A base UI primitive kit: Button, Input/Textarea/Label/Field, Select, Card, Badge, Separator, Skeleton, Avatar, Spinner
- Branded logo (mark + wordmark), branded loading spinner, branded full-page loading screen
- Branded 404 (`not-found.tsx`) and error boundary (`error.tsx`)
- Root layout: fonts via `next/font` (Geist Sans/Mono + Space Grotesk display), metadata defaults, theme-synced toast system (sonner)
- `sitemap.ts`, `robots.ts`, `manifest.ts`, file-convention favicon (`icon.svg`) + Apple touch icon (`apple-icon.tsx` via `ImageResponse`)
- ESLint flat config enforcing two project conventions as **real lint errors**, not just documentation (see below)

### Milestone 1 review — findings and fixes

| Finding                                                                                                                                                                                                                                                                                                                                                                                           | Raised by        | Fix                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `@typescript-eslint/explicit-function-return-type` was set to `'warn'`, but `package.json`'s lint script uses `--max-warnings=0` — any warning fails the build identically to an error. Requiring explicit return-type annotations on every React component (not the actual stated requirement, which was parameter typing) would have failed lint on nearly every component file in the codebase | Engineering      | Turned off, with the reasoning documented directly in `eslint.config.mjs`                                      |
| Two non-null assertions in `avatar.tsx`'s `getInitials` would have tripped the `no-non-null-assertion` warn-rule under that same zero-tolerance setting                                                                                                                                                                                                                                           | Engineering      | Rewritten to avoid them via proper control-flow narrowing on local `const` bindings, not a suppression comment |
| `PageTransition` — the single most frequently-triggered animation in the app (every navigation, not just a loading state) — never checked `useReducedMotion()`, unlike every other animated component                                                                                                                                                                                             | UX/Accessibility | Now falls back to an instant, non-animated swap when motion is reduced                                         |
| `ThemeToggle` had no visible hover affordance for sighted mouse users — only screen readers got the full context via `aria-label`                                                                                                                                                                                                                                                                 | Product          | Added a native `title` attribute; not worth a full Tooltip primitive for one button                            |

**Found in the M2 session, once real `tsc`/`eslint` could actually
run (see BUILD_PLAN.md Section 2a for full detail on each):** three
`exactOptionalPropertyTypes` type errors (`theme-toggle.tsx`,
`branded-loading-screen.tsx`, `spinner.tsx`), and `eslint.config.mjs`
itself needed migrating off the `FlatCompat` bridge to
`eslint-config-next`'s now-native flat-config exports, which is what
had been silently masking those type errors and a couple of real lint
violations behind a syntax-only check all along. Also:
`src/app/icon.svg` was referenced by `layout.tsx`/`manifest.ts` but
missing from the actual M1 bundle — recreated in M2, most likely lost
in one of that session's sandbox resets.

## Milestone 2 — Marketing site: complete

- All public pages: Home, How it works, Modules (overview + a dynamic
  `/modules/[module]` detail page for Employee/Product/Client/Identity),
  Pricing, About, FAQ, Contact, and all three Legal pages (Privacy,
  Terms, Cookies)
- `(marketing)` route group with its own header/footer layout; the M1
  placeholder `page.tsx` is gone, replaced by the real homepage
- The AI flow-generation feature as the hero's signature element
  (`FlowGenerationShowcase`) — plays once on scroll into view, reuses
  the Employee module's own example-steps data, reused again on the
  How It Works page
- A real Contact form (react-hook-form + Zod validation) posting to
  `api/contact/route.ts`, honeypot-protected client- and server-side
  — see "Known gaps" below
- `(auth)` route group with minimal `/login`/`/signup` placeholder
  pages — exist only so `typedRoutes` has a valid target for the
  header/footer's CTAs ahead of Milestone 3, same role M1's own
  placeholder homepage played for `/`
- A new `--inverse`/`--inverse-foreground` token pair in
  `globals.css` for the bold, theme-independent navy CTA band the
  reference brand language calls for
- Real, populated `sitemap.ts` entries for every page

Full detail on every M2 decision — the dynamic module route's
`generateStaticParams`/`dynamicParams = false` choice, why the legal
pages' governing-law section is an explicit bracketed placeholder
rather than a fabricated jurisdiction, why pricing figures are
illustrative, the new shared `fieldError()` helper and why M3's forms
will want it too — is in BUILD_PLAN.md's M2 section, not duplicated
here.

## Milestone 3 — Auth: complete

- Real Login and Signup pages (react-hook-form + Zod), replacing M2's
  placeholder stubs
- Four BFF route handlers (`api/auth/login`, `/signup`, `/refresh`,
  `/logout`) — `NEXT_PUBLIC_API_URL` is the only config they need,
  already in `.env.example`
- `AuthProvider` — in-memory access token, bootstrap-on-load silent
  refresh, mounted once at the root layout
- `proxy.ts` — **not** `middleware.ts`: Next.js 16 renamed the file
  convention mid-session (`export function middleware` →
  `export function proxy`); this codebase already uses the current
  name. Does an optimistic, cookie-presence-only redirect for
  protected routes and the authenticated-hitting-`/login` case
- A minimal `(app)` route group (layout + a placeholder `/dashboard`)
  proving the whole loop end-to-end — Milestone 4 expands this shell
  in place rather than recreating it
- `types/enums.ts` and `types/auth.ts` — this codebase's first
  hand-written types mirroring the real backend contract

The signup password rule (12+ characters, one upper, one lower, one
number) is a documented best-effort reconstruction, not a verified
fact — BUILD_PLAN.md's M3 section explains exactly why and where the
one file to correct it lives if the real backend rule differs. Full
detail on every other M3 decision (why `/refresh` and not `/session`,
why `AuthUser.role` is singular, the proxy's optimistic-check
trade-off) is there too, not duplicated here.

## Milestone 4 — App shell + dashboard home: complete

- Real Sidebar (desktop + mobile), a hand-built Cmd+K command palette
  (no dedicated library in the dependency list), an upgraded topbar
  with a proper Avatar-based user menu
- `QueryProvider` (TanStack Query) — scoped to the `(app)` route group
  only, not the whole site
- The typed API client layer: `lib/api/client.ts` (bearer token +
  retry-once-on-401), `lib/api/entities.ts` + `lib/api/flows.ts` (the
  read path this milestone needs — Milestone 5 adds writes to these
  same two files)
- `types/entity.ts`, `types/flow.ts`, `types/enrollment.ts` —
  including the full Step discriminated union and Condition AST,
  copied field-for-field from BUILD_PLAN.md Section 4's contract
- A real dashboard home with four live stat cards, genuinely computed
  from actual API calls (there's no dedicated stats endpoint) — not
  placeholder numbers
- Five placeholder pages (`entities`, `flows`, `enrollments`,
  `verification`, `settings`) so the sidebar/palette have somewhere
  valid to link, same precedent every prior milestone set

Full detail on every M4 decision — why the People/Accounts and
Published/Draft-flows stat cards use genuinely different counting
strategies, the second `set-state-in-effect` false positive and the
inline-IIFE fix that resolved it, a `bg-navy/40` modal backdrop bug
caught before shipping — is in BUILD_PLAN.md's M4 section.

## Milestone 5 — Entities & Flows (read-heavy CRUD): complete

- Entities: list (type filter, cursor-based "Load more"), detail
  (attributes, relationships in both directions, an inline
  add-relationship form), and creation (a dynamic key-value attributes
  editor)
- Flows: list (module + status filters), detail (read-only step
  summaries per StepType, a version badge, a Publish button that only
  shows in DRAFT), and a template gallery for creating new flows
- `lib/flows/format-condition.ts` — renders the Condition AST as
  plain language for the read-only step summaries
- All five placeholder `(app)` pages from Milestone 4 are now real,
  except Settings, which an unassigned future pass still owns
  (Enrollments and Verification were completed in Milestone 8)

One real constraint worth knowing before extending this: `GET /flows`
returns bare `Flow` objects with no `status` field — that only exists
on `FlowVersion`, returned by the single-flow detail endpoint. The
Flows list page can't show a per-row status badge without an N+1
fetch, so it doesn't. Full detail on this and the rest of M5's
decisions (the entity picker's real search-endpoint limitation, a
genuine conflict between `restrict-template-expressions` and
react-hook-form's own path typing) is in BUILD_PLAN.md's M5 section.

## Milestone 6 — Flow builder: complete

- A real drag-reorderable step list, using Motion's `Reorder.Group`/
  `Reorder.Item` — already a dependency, no new library added
- An add/edit panel per step type with a real typed form matching
  each type's exact config shape
  (`components/flows/builder/step-config-forms/`, one file per
  StepType)
- Entry-step selection and the draft/publish lifecycle
  (`/flows/[flowId]/edit`, linked from the M5 detail page)
- Compound (AND/OR/NOT) branch conditions are a deliberate, flagged
  scope boundary — the interactive branch editor handles simple
  conditions only; a compound one renders read-only

**A real bug was found and fixed while building the reorder feature,
worth knowing if you touch this code:** updating the query cache
directly during a drag (before the position-persisting mutation ran)
would have made the save logic see "nothing changed" and silently
persist zero updates — drags would have appeared to work, then
reverted on reload. The fix keeps drag state completely separate from
the cache until the save actually succeeds. Full detail, including
exactly which callback (`onReorder` vs `onDragEnd`) is allowed to
touch what, is in BUILD_PLAN.md's M6 section — read it before changing
this logic.

## Milestone 7 — AI Flow Drafting UI: complete

- A generation composer (module select + description) that kicks off
  an async `POST /flow-drafts` job, and a polling layer that stops the
  instant the job leaves `PENDING`
- A genuinely substantive "generating" state (elapsed-seconds ticker,
  kind-specific copy for a first generation vs. a refinement) rather
  than a bare spinner
- A draft preview reusing M6's own `StepSummaryCard` in read mode — no
  second, parallel step-rendering system
- An inline refinement loop and a materialize action that lands the
  user in the M6 builder on the new DRAFT flow
- `/flows/new` restructured into three genuinely equal-weight ways to
  start a flow (AI / template / scratch), with AI generation as its
  own focused route at `/flows/generate`

**The real finding worth knowing if you touch this code:** an AI
draft's steps reference each other by a client-side `key` string, not
a real database `id` (nothing is persisted until materialize), so
`StepSummaryCard` — built around resolving references by `id` — had
its `step` prop widened to a union (`Step | AiFlowDraftStep`) rather
than being forked into a second component, with a small
`getNextPointer()` helper picking the right pointer field at render
time. Full detail, including exactly which fields are real ids versus
pre-materialization keys, is in BUILD_PLAN.md's M7 section — read it
before changing this component's prop type.

One honest caveat: the `useSearchParams()`/`Suspense` split on
`/flows/generate` was verified by exactly matching this codebase's own
established pattern (`(auth)/login/page.tsx`), not by a real passing
`next build` — this sandbox's build always fails earlier, at the root
layout's blocked font fetch. A session with real network access should
confirm this route specifically.

## Milestone 8 — Enrollments, Verification & Triggers: complete

- An enrollment detail page (`/enrollments/[enrollmentId]`) with a
  step-execution timeline (connecting rail, status-colored dots,
  per-row output) and a dispatching action panel with a real
  completion UI per step type (FORM/TASK/CONTENT/APPROVAL)
- A verification session detail page with a manual-decision form and a
  request-reverification action, plus a `/verification` queue
  defaulting to the manual-review filter
- An `/enrollments` flow-picker-plus-list page and a "Start enrollment"
  action on the Entity Detail page — there's no flat or per-entity
  enrollment list in the real API, only flow-scoped, so this UI is
  shaped around that limitation rather than working around it
- Cross-module trigger configuration on the flow detail page
  (`TriggersSection`), reusing M6's `SimpleConditionEditor` for the
  trigger's optional condition, gated to ADMIN+ for writes the same way
  the real API gates them

**The real finding worth knowing if you touch this code:** a WAITING
step of type VERIFICATION is never completed through the generic
`POST /enrollments/:id/steps/:id/complete` endpoint — it only resolves
through the verification session itself (a partner webhook or a manual
decision), both of which call the same engine function that endpoint
would otherwise call. A second approve/reject form bolted onto the
step timeline wouldn't just be redundant, it could race the session's
own resolution path and resolve the same step decision twice.
`verification-step-action.tsx` is therefore deliberately read-only —
status plus a link into the session page — while every other step
type's action component calls the generic endpoint directly. Full
detail, plus the `FlowTrigger` type-definition bug this verification
pass also caught, the flowId/stale-steps gap, and a cross-variable lint
error that only a full-project `eslint .` run surfaced, is in
BUILD_PLAN.md's M8 section — read it before changing any of this.

## Milestone 9 — Super Admin Dashboard: complete

- A genuinely separate `/admin` section: its own `AdminAuthProvider`
  (no bootstrap-restore, no refresh token, no shared state with the
  tenant app's `AuthProvider`) and its own login page, guarded entirely
  client-side (`(dashboard)/layout.tsx`) since there's no server-visible
  signal for a proxy-layer check to read at all
- A single horizontal `AdminTopbar` nav (Tenants, Feature Flags, and a
  role-conditional Impersonation Activity link) rather than a Sidebar
  split — not enough surface yet to earn that
- Tenant Health list (`/admin`) and detail (`/admin/tenants/[id]`)
  pages, the detail page carrying a module-override form (REVOPS+) and
  an impersonate form (SUPPORT+)
- A Feature Flags page, readable by every admin role with
  create/edit/delete gated to ENG_ON_CALL+ — a true upsert keyed on
  (key, scope, tenantId), so "editing" a flag locks those identity
  fields rather than risking an accidental new row
- A full impersonation flow: a persistent warning banner in the tenant
  app's own shell for the session's duration, and an Impersonation
  Activity viewer (SUPPORT/COMPLIANCE/ENG_ON_CALL)

**The real finding worth knowing if you touch this code:** an
impersonation session has no refresh token and therefore no cookie at
all — but `proxy.ts`'s existing cookie-presence check still runs on
every request into a protected tenant route, including the
impersonating admin's very first navigation into `/dashboard`. Without
some cookie, that check redirects straight back to `/login` before the
in-memory session set via `beginImpersonation` ever renders anything —
a pure runtime redirect loop invisible to `tsc`/`eslint`. The fix is a
second, presence-only marker cookie set by one deliberately narrow BFF
route (`POST /api/admin/impersonate`, the only admin-side call in this
app that proxies through Next.js rather than going straight to the
backend) — the access token itself still never touches a cookie, same
as everywhere else in this app. This is also the one deliberate
crossing of the two otherwise-strictly-separate auth stacks in this
codebase: the admin-side tenant-detail page calls the TENANT
`useAuth().beginImpersonation(...)` directly. Full detail — including
why a dead impersonation session must never retry through the real
refresh flow, and why ending one logs the admin out of `/admin` too (on
purpose) — is in BUILD_PLAN.md's M9 section; read it before changing
any of this.

## Milestone 10 — Hardening: complete

- A keyboard-operable alternative to the flow builder's pointer-only
  drag reorder (explicit move-up/move-down buttons calling the same
  mutation a drag gesture would) plus a real `role="list"`/
  `role="listitem"` pair that Tailwind's preflight had silently
  stripped (it also strips the implicit list ARIA role, not just
  `list-style`)
- A full ARIA combobox/listbox rewrite of the command palette —
  `aria-activedescendant`-driven selection instead of real DOM focus
  landing on results, a focus trap, and focus restored to whatever
  element opened it
- One dynamic `opengraph-image.tsx` shared by every `(marketing)`
  route, built only after confirming — by reading Next's own metadata
  resolution source, not assuming — that the text-field OG/Twitter
  metadata was already complete via auto-inheritance; the image was
  the one real gap
- A genuine blank-area bug fix in the enrollment step timeline (it
  rendered a bare, unexplained list on zero executions), plus five
  empty-state messages across the app that now distinguish "nothing
  exists yet" from "nothing matches this filter" instead of showing
  the same unhelpful text for both
- Two scoped `error.tsx` boundaries — `(app)/error.tsx` and
  `admin/(dashboard)/error.tsx` — placed to match exactly where the
  Sidebar+AppTopbar and AdminTopbar chrome are mounted

**The real finding worth knowing if you touch error handling or the
app shell:** an `error.tsx` boundary wraps its own folder's
`{children}` slot but never the sibling `layout.tsx` in that same
folder. With only the root `error.tsx` this project shipped with
through M9, an unhandled error anywhere in the app bubbled all the way
past `(app)/layout.tsx` — Sidebar and AppTopbar included, since the
whole layout's rendered output is itself the root layout's
`{children}` — up to the root boundary, leaving a person with no
navigation left at all except a hard reload. The two new boundaries
are placed exactly as deep as the chrome they need to protect:
`admin/(dashboard)/error.tsx`, not the outer `admin/error.tsx`,
because `AdminTopbar` is mounted by `(dashboard)/layout.tsx`
specifically — the outer layout is a bare `AdminAuthProvider` wrapper
shared with `/admin/login` and owns no chrome of its own. The
performance and loading-skeleton audits in this same milestone both
came back clean passes, documented as such rather than padded with
invented fixes to look thorough. Full detail on every decision in this
milestone, including the OG image's font-loading and color-accuracy
specifics, is in BUILD_PLAN.md's M10 section; read it before changing
any of this.

## Continuing this build

**If you're picking this up in a fresh session:** all 10 planned
milestones are complete — this is further work on a finished build,
not a continuation of an open roadmap. Read `BUILD_PLAN.md` first
regardless — it has every architecture decision made so far with its
reasoning, the exact backend API surface this app consumes, the
"Known gaps (deliberate, not oversights)" section below for what was
knowingly left out of the original 10-milestone scope, what
verification tooling actually works in this sandbox (Section 2a —
check this before assuming a past session's environment notes still
apply), and the environment-volatility lessons from the M1 session
written up as concrete operating instructions, not just a warning.

**Checkpoint discipline:** zip and save to the persistent output
location after **every single file change**, not every 2-4 files and
not at milestone boundaries. Adopted after the M1 session's sandbox
resets as "every 2-4 files"; the Section 0 backend-verification fix
pass later proved even that too loose — a batch of ~9 applied fixes
was lost to a reset twice in a row before the discipline tightened to
one file per checkpoint, after which nothing was lost again. Costs a
few seconds per file; the alternative is real, repeated reconstruction
work, which this project has paid for more than once.

**Before writing new code, re-verify:** `npm install`, then
`npx tsc --noEmit` and `npx eslint . --max-warnings=0` — both should
be clean on the current tree. If either isn't, fix the baseline before
adding to it, the way every session since M2 has.

## Type conventions

This codebase never uses `z.infer<...>`. Every type consumed by
application code is an explicit, hand-written `interface` or `type`
alias, kept next to (never derived from) any Zod schema used for
runtime validation (form validation, etc.) — enforced by
`eslint.config.mjs`'s `no-restricted-syntax` rule as a real lint
error, not just convention.

Rationale: it decouples the type contract application code relies on
from the validation implementation detail, which can be swapped or
adjusted without silently changing every consumer's inferred type.
More duplication between a schema and its type than a typical
Zod-first codebase — accepted deliberately, not an oversight.

## Design tokens

Every color and font resolves through a CSS custom property defined
once in `src/app/globals.css`'s `@theme` block — a two-layer system
(raw OKLCH palette, then semantic tokens like `--primary`/`--background`
that get redefined per theme). No hardcoded hex/rgb values in
component `className` strings — also enforced by `eslint.config.mjs`.

**Four narrow, deliberate, documented exceptions** exist where a
literal color value is technically unavoidable — each is called out
with a comment at its exact location, not silently inconsistent with
the rule above:

1. `layout.tsx`'s `viewport.themeColor` — read by OS browser chrome before the app's own CSS necessarily loads.
2. `app/icon.svg` — a standalone favicon file has no CSS cascade to inherit `currentColor` from.
3. `app/apple-icon.tsx` and `app/manifest.ts` — render/serialize outside the app's own CSS context entirely.

All three use the exact same `oklch()` value as the corresponding
design token (or, where oklch() itself can't be used, the precise hex
equivalent) rather than an eyeballed approximation.

Milestone 2 added one new semantic pair,
`--inverse`/`--inverse-foreground` (plus
`--inverse-muted-foreground`/`--inverse-border`) — not an exception to
the token system, a real extension of it: a deliberately
theme-_independent_ dark surface for
the marketing site's bold navy CTA band, layered on the same raw
palette everything else uses. See its comment in `globals.css` for why
it's distinct from `--navy`/`--navy-foreground`, which _does_ invert
per theme.

## Architecture: authentication (built in Milestone 3, decided now)

Access token in memory only (a React context), never written to
`localStorage`/`sessionStorage`. Refresh token in an httpOnly, Secure,
SameSite=Lax cookie, set by a thin Next.js Route Handler BFF that
proxies only `login`/`signup`/`refresh`/`logout` to the backend — the
browser's own JS never touches the refresh token. Once bootstrapped,
business API calls (entities, flows, enrollments, etc.) go directly
from client components to the backend with a bearer header, avoiding
proxy overhead for the bulk of app traffic. No backend changes
required — this consumes the existing REST contract exactly as built.

## Architecture: admin authentication (built in Milestone 9, decided now)

A deliberately separate, differently-shaped system from the above, not
a variant of it — platform-admin sessions have no refresh token at all
(short-lived by design, per the real backend), so there's no cookie, no
bootstrap-restore, no retry-on-401, and no BFF proxy for login itself
(`adminLogin` calls the backend directly). A hard reload of any
`/admin/*` page always requires signing in again, which is accepted,
not a gap. `AdminAuthProvider` is mounted only at `src/app/admin/layout.tsx`,
never the root layout, keeping the two identity spaces genuinely
separate — a discriminated JWT `kind` enforces this on the backend, and
two separate bridge modules (`auth-bridge.ts` vs `admin-auth-bridge.ts`)
make mixing the two token spaces a compile-time impossibility on this
side too. Platform-admin roles (SUPPORT/COMPLIANCE/ENG_ON_CALL/REVOPS/
SUPER) are an allow-list per route, not a ranked hierarchy — see
`hasAnyPlatformRole` in `@/types/enums`, and don't reuse the tenant
app's rank-based `hasAtLeastRole` for an admin check. The one exception
to "no BFF" is impersonation, which needs a Next.js Route Handler to
set the marker cookie described in Milestone 9's section above.

## Scripts

```bash
npm run dev            # Next.js dev server with Turbopack
npm run build           # production build
npm run lint             # ESLint, zero warnings tolerated
npm run typecheck        # tsc --noEmit
npm run test              # Vitest
npm run format            # Prettier, with Tailwind class sorting
```

## Known gaps (deliberate, not oversights)

Three of the four items originally listed here were closed in a
post-M10 round — see "Post-M10: error reporting, contact-form
delivery, legal/pricing copy" below for what that round built and,
just as importantly, what it deliberately left for a human to decide.
This list now reflects what's actually still open.

- **No E2E test suite yet** — Vitest + React Testing Library covers
  component-level testing; Playwright E2E is a reasonable addition now
  that M3/M4 give the app enough real user-flow surface (login →
  dashboard → navigate) to make E2E coverage meaningfully different
  from component tests — not done yet, just no longer blocked on
  "there's nothing to click through." No Vitest config/setup file
  exists yet either (`npm run test` has nothing to run against) —
  noticed in M2, not fixed, since it was orthogonal to the marketing
  site at the time and not worth a partial/rushed setup; worth
  revisiting now that there's real interactive logic (forms, auth,
  data fetching) to actually test. Offered in the same round that
  closed the three gaps above; not chosen, so still fully open.
- **Real pricing figures and the Terms' governing-law jurisdiction are
  still placeholders** — these are business and legal decisions, not
  engineering ones, and nothing in this codebase guesses at either.
  The three tiers on `/pricing` are illustrative (now honestly
  labeled as such on the live page itself, not just in this doc), and
  Terms' governing-law section is left as an explicit
  `[bracketed placeholder]` rather than a fabricated jurisdiction. The
  Privacy/Terms/Cookie pages generally remain a reasonable draft
  grounded in what the product actually does, not a substitute for
  real counsel review before this goes live.
- **No error-reporting provider's DSN, and no contact-form delivery
  credentials, are actually configured anywhere in this repo** — the
  integrations themselves are real and wired up (see the section
  below), but every secret they need is an env var `.env.example`
  documents and nothing sets; both are safe, confirmed no-ops without
  them, not a broken half-finished state.

## Post-M10: error reporting, contact-form delivery, legal/pricing copy

Done in a follow-up round, after M10 shipped, closing three specific
items from this same "Known gaps" list on request — not a renumbered
11th milestone (BUILD_PLAN.md Section 8 says more on why that
distinction matters). A fourth option offered in the same round, an
E2E test suite, was not chosen and remains fully open above.

- **Real Sentry error reporting** — `@sentry/nextjs` wired through
  `src/instrumentation.ts`, `instrumentation-client.ts`, both
  `sentry.*.config.ts` files, and `next.config.ts`'s `withSentryConfig`
  wrapper, with `Sentry.captureException` added to all three
  `error.tsx` boundaries. Every piece of this is a confirmed no-op —
  not a guess, checked against the installed package's own source —
  until `NEXT_PUBLIC_SENTRY_DSN` is set, so this builds and runs
  exactly as before on a machine with no Sentry project yet.
- **Real contact-form delivery via Resend** — additive to, never a
  replacement for, the original validate-and-log behavior. Gated on
  `RESEND_API_KEY`, checked explicitly before ever constructing a
  client: Resend's own SDK throws synchronously on a missing key
  (confirmed from its source — genuinely different behavior from
  Sentry's silent no-op, not assumed to match it), so this route would
  have crashed its first real request if that difference had been
  missed.
- **A legal/pricing copy pass** — the Privacy Policy gained a new
  section disclosing platform-administrative access (support
  impersonation, monitoring) that didn't exist when M2 originally
  wrote that page, and its data-security section's absolute "data
  does not cross tenant boundaries" claim was corrected to carve out
  that same access. The Cookie Policy now documents the second cookie
  M9's impersonation flow actually added, instead of still claiming
  there's only one. The Pricing page gained a small, honest,
  visitor-facing note that its figures are illustrative — that caveat
  previously existed only in this README and BUILD_PLAN.md, never on
  the page a real visitor would actually see.

Full detail, including the exact env vars each integration reads and
why each one degrades safely without them, is in `.env.example` and
BUILD_PLAN.md's Section 8.
#   o n b o a r d o s - w e b  
 