# OnboardOS Frontend — Build Continuation Plan

**Purpose of this document:** a future session picking up this build —
possibly with zero visible conversation history, given this session's
own demonstrated environment volatility — should be able to read this
one file and continue effectively, without needing to re-derive
architecture decisions or re-read the entire backend conversation.

**Current status as of this writing:** Milestones 1–10 (Foundation,
Marketing site, Auth, App shell + dashboard, Entities & Flows read UI,
Flow builder, AI Flow Drafting UI, Enrollments/Verification/Triggers,
Super Admin Dashboard, Hardening) complete and reviewed — **this is now
a feature-complete build of the full planned scope; no milestones
remain.** A verification session against the real backend source found
concrete bugs in the M5/M6 code as shipped (Section 0.4, 12 items);
after several sandbox resets wiped each attempt before it could be
checkpointed, **all 12 items are now applied, plus the Flows-list
status-badge follow-on item 6 called for, and verified clean** (`tsc
--noEmit`, `eslint --max-warnings=0`, `prettier --check`, and a `next
build` that reaches the expected sandboxed-font-fetch failure and
nothing earlier). Nothing from the verification pass remains open —
see Section 0.4 for the full list and what each fix touched. M7
through M10 (Section 5's own entries, below) are all built and
verified clean the same way; M7 carries one honest caveat (its
`useSearchParams()`/`Suspense` split was checked by matching this
codebase's own established pattern, not by a real passing build — see
M7's retrospective for why), M8's retrospective documents a real
cross-variable lint error (`restrict-template-expressions`) that only
a full-project `eslint .` run surfaced, plus a stale task-tracker entry
that turned out not to be a live bug, M9's retrospective documents the
cookie-based handoff a no-refresh-token impersonation session needs
just to survive `proxy.ts`, plus the platform-admin RBAC
allow-list-vs-rank distinction caught before any admin UI existed to
get it wrong in, and M10's retrospective documents the two real
accessibility gaps found and fixed (the flow builder's drag reorder
had no keyboard path at all; the command palette wasn't a real ARIA
combobox), a genuine blank-area empty-state bug plus five
filter-unaware empty-state messages, and the complete absence of both
social-share images and scoped `error.tsx` boundaries before this
pass — plus why the performance and loading-skeleton audits came back
clean rather than getting padded with invented fixes. All ten planned
milestones are complete. **Since then, Section 8 (not a renumbered
milestone — read its own opening note) closed three of README's four
"Known gaps":** real Sentry error reporting, real contact-form
delivery via Resend, and a legal/pricing copy pass — all three
config-only and inert until real credentials are supplied, inventing
no real pricing figures or legal conclusions. 179 source files under
`src/`.

---

## 0. READ THIS FIRST — real backend access changed everything (session after M6)

A session after M6 was given **five planning docs and the actual
`onboardos-backend` source** (previously, every backend fact in this
document was "a careful reconstruction from memory," as Section 4 used
to say). That session did a deep, methodical verification pass against
real source and found the 12 items in Section 0.4 below. Applying them
took several further attempts — this environment reset mid-fix at
least twice, wiping every uncheckpointed change both times — before a
session finally got all 12 items applied with a checkpoint (a full
project zip to `/mnt/user-data/outputs/`) after literally every single
file edit, not just after each numbered item. **That discipline is why
the fixes survived this time, and it's the one to keep using**: this
environment can reset mid-tool-call, mid-edit, with no warning (it did
so again, harmlessly, partway through this very fix pass — cwd resets
between turns are normal and lose nothing, but a full home-directory
wipe has happened multiple times in this session and loses everything
not yet zipped to `/mnt/user-data/outputs/`). The safe unit of work is
one file write, not one logical fix or one milestone. The original
uploaded files (backend zip + 5 docs) should still be in the uploads
mount, but **treat "still there" as this environment's default, not a
guarantee** — re-upload if a future session doesn't find them.

**All 12 items are now applied and verified** (see each item's status
tag below) — there is nothing left open from this verification pass.

### 0.1 — The five new docs are the ORIGINAL, aspirational planning vision. The real backend is a scoped-down, pragmatic MVP of it. Don't confuse the two.

The uploaded docs (`Unified-Onboarding-Platform-PRD`,
`OnboardOS-Product-Management`, `OnboardOS-UIUX-Decisions`,
`OnboardOS-Frontend-Decisions`, `OnboardOS-Backend-API-Engines-Design`)
describe a genuinely ambitious platform: four separate deployable
frontend apps (Builder/Admin on Vite, a server-rendered Portal app, an
Embeddable SDK compiled to Preact, a separate Super Admin app), a
GraphQL BFF, Turborepo, Zustand, Radix UI, React Flow, NestJS,
Temporal for durable execution, ClickHouse for analytics. **Verified
directly against the real backend source this session: none of that
backend architecture exists.** The real `onboardos-backend` is a
single Fastify + Drizzle + PostgreSQL + BullMQ modular monolith
(`SERVICES.md` in the backend repo says so explicitly: "one deployable
to host, not five"), exposing a plain REST API — no GraphQL endpoint
anywhere in the codebase.

**This means: this Next.js monolith frontend is the architecturally
correct match for what actually got built, not a deviation from a
"real" plan that needs correcting toward the docs' vision.** The
docs' 4-app/GraphQL/Preact-SDK topology was evidently scoped down
during real implementation — a completely normal thing for an
ambitious PRD to undergo — and this frontend should keep being built
against the real backend that exists, not retrofitted toward planning
documents describing a backend that was never built. **Do not
interpret these docs as a mandate to split this app into four, adopt
GraphQL, switch to Vite, or add Zustand/Radix/React Flow.** They are
extremely valuable for a different reason (0.2).

### 0.2 — What the five docs ARE valuable for

Product thinking, rationale, and specific UX decisions that remain
completely applicable regardless of the scoped-down architecture:

- **PRD:** the four-vertical market scan and cross-vertical pain
  points ("no-code that secretly needs dev/CSS work," "portal nobody
  revisits," "implementation harder than the demo," pricing opacity)
  are the actual reasoning behind features already built (the AI
  flow-generation showcase, Slack-adjacent messaging step types,
  transparent per-module pricing on the marketing site) and should
  keep informing M7+ copy and prioritization.
- **UI/UX Decisions doc:** specific, still-applicable decisions —
  "AI-assisted first draft sits beside start from scratch, not hidden
  in a menu" (directly actionable for M7's entry point placement),
  "loading states must distinguish saving vs. AI generating vs.
  fetching — generic spinners are disallowed" (directly actionable for
  M7's polling UX), "no dead ends in setup," "progress always visible."
- **Product Management doc:** the RICE-with-leverage-multiplier
  framing and the Definition of Done checklist are good judgment
  calls to keep applying even without the full org/epic structure
  they're embedded in.
- **Frontend Decisions / Backend Engines Design docs:** lowest
  direct applicability (their core architecture proposal wasn't
  built), but still useful for specific isolated ideas if any come up
  (e.g., the accessibility/testing philosophy sections are
  architecture-agnostic).

Read these for **product judgment**, not for **API contracts or
frontend topology** — Section 4 below (verified against real source)
and this app's own established architecture are authoritative for
those.

### 0.3 — Where the source files are

As of the interrupted session's end: `onboardos-backend-milestone-8.zip`
and all five `.md` docs were in the uploads mount;
`onboardos-frontend-milestone-6.zip` (the last good, fully-verified
checkpoint) was in the outputs mount. If a fresh session doesn't find
them, ask for a re-upload — don't attempt to reconstruct backend facts
from memory when the real source has already been made available once
and could be again. Key backend files worth going straight to (found
during this investigation, saves re-discovering the module layout):

- `SERVICES.md` (repo root) — the architecture narrative, confirms the modular-monolith framing above
- `src/modules/auth/auth.schemas.ts` + `src/modules/auth/rbac.ts` — auth contract + role ranking
- `src/db/schema/core.schema.ts` + `src/db/schema/onboarding.schema.ts` — the definitive field-level source of truth for every table
- `src/modules/flows/flows.routes.ts` + `flows.schemas.ts` — every Flows/Steps endpoint's exact request/response shape
- `src/modules/workflow/workflow.types.ts` + `condition.ts` — exact step config schemas + the Condition AST + path convention
- `src/modules/flow-drafting/flow-drafting.routes.ts` + `.schemas.ts` + `.types.ts` — the M7 AI-drafting contract, key-based (not id-based) step references

### 0.4 — Verified findings and the fixes they need (apply these before or as part of M7)

Every item below was checked directly against real backend source
this session. None of these fixes have been applied to the M6
checkpoint. Ordered roughly by severity — the first few are genuine
"this feature doesn't actually work" bugs, not polish.

1. ✅ **APPLIED — `lib/auth/backend-auth.ts`.** CRITICAL —
   `/api/auth/refresh`'s response shape assumption is
   wrong; the refresh flow as shipped is likely broken.
   `lib/auth/backend-auth.ts`'s `BackendRefreshResponse` interface
   assumes `/v1/auth/refresh` returns
   `{accessToken, refreshToken, expiresInSeconds}` flat. The real
   schema (`auth.schemas.ts`:
   `refreshResponseSchema = z.object({ tokens: authTokensSchema })`)
   nests all three fields under `tokens`, exactly
   like login/signup's response — refresh is NOT flat the way this
   code assumes. Fix: change `BackendRefreshResponse` to
   `{ tokens: BackendTokens }` and update `refreshWithBackend`'s field
   access (`refreshResult.data.tokens.refreshToken`,
   `.tokens.accessToken`) to match. This affects every returning-user
   session bootstrap and every mid-session 401 retry — high
   real-world impact.

2. ✅ **APPLIED — `types/flow.ts`, `lib/flows/generate-key.ts` (new),
   `flow-builder-view.tsx`.** CRITICAL — Every "add step" call in the
   M6 builder is missing a
   required field and would fail against the real backend. The real
   `createStepRequestSchema` requires `key` (a stable, lowercase
   `^[a-z][a-z0-9_]*$` identifier, 1-60 chars, used for condition-path
   references like `steps.<key>.output.field` — completely separate
   from the step's `id`, which is what `nextStepId`/`onRejectStepId`
   still correctly reference). `types/flow.ts`'s `Step`/`StepInput`
   don't have a `key` field at all, and
   `flow-builder-view.tsx`'s `buildStepInput` never sends one. Fix:
   add `key: string` to `BaseStep` and every `StepInput` variant;
   generate one at creation time with a small new
   `lib/flows/generate-key.ts` helper — a random suffix
   (`type_` + 8 random hex chars) sidesteps collision reasoning
   entirely, e.g. a title-slug approach could collide with an earlier
   deleted step's now-reusable key. Also apply the same missing-`key`
   problem to `FormField` — each form field also needs one
   (`form-config-form.tsx`'s `emptyField()` currently creates
   `{ key: '', ... }`).

3. ✅ **APPLIED — `flow-builder-view.tsx`'s `buildStepInput`.**
   CRITICAL — A brand-new FORM step is created with zero fields,
   which the real backend rejects outright.
   `structuredFormConfigSchema.fields` requires `min(1)` — creating a
   FORM step with `config: { fields: [] }` (current
   `buildStepInput` behavior) fails validation immediately. Fix:
   default a new FORM step to one field with its own generated key
   and a placeholder label, e.g. `Field 1`.

4. ✅ **APPLIED — `lib/api/flows.ts`'s `publishFlow`,
   `flow-detail-view.tsx`'s `publishMutation`.** HIGH — `publishFlow`'s
   assumed return shape is wrong and would
   corrupt the flow-detail cache. The real
   `POST /flows/:flowId/publish` returns only the updated
   `flowVersionSchema` (200), not the full `flowDetailResponseSchema`.
   `flow-detail-view.tsx`'s `publishMutation.onSuccess` currently does
   `queryClient.setQueryData(flowDetailQueryKey(flowId), data)`,
   replacing the entire cached `{flow, currentVersion, steps}` object
   with a bare `FlowVersion` — every reader of that cache entry
   (the detail view itself, the M6 builder sharing the same key)
   would break immediately after a successful publish. Fix: change
   `publishFlow`'s return type to `FlowVersion`, and merge it into the
   existing cache entry's `currentVersion` field on success instead of
   replacing the whole entry (`flow-detail-view.tsx` — see that file's
   `publishMutation` once fixed for the exact pattern).

5. ✅ **APPLIED — `lib/api/flows.ts`'s `updateFlow`,
   `flow-builder-view.tsx`'s `entryStepMutation`.** HIGH —
   `updateFlow`'s assumed return shape is wrong the other
   direction. `PATCH /flows/:flowId` returns the full
   `flowDetailResponseSchema`, not a bare `Flow` — the inverse mistake
   from #4. Fix: change `updateFlow`'s return type to `FlowDetail`;
   `flow-builder-view.tsx`'s `entryStepMutation.onSuccess` should
   replace the whole cache entry with the response (it's already
   complete), not try to merge just a `flow` field into it.

6. ✅ **TYPE FIX APPLIED — `types/flow.ts`, `flow-builder-view.tsx`'s
   entry-step select. The UI follow-on this item calls out below
   (a real status badge on the Flows list page) is still open.**
   MEDIUM — `Flow`
   was missing its own real `status` field, and
   `entryStepId` was on the wrong type. This traces back to a wrong
   M5 assumption ("GET /flows returns bare Flow objects with no status
   field," documented at the time as a real constraint) that turns out
   to be incorrect: the `flows` table has its own `status`
   (`flowStatusEnum` — DRAFT/PUBLISHED/ARCHIVED), a _different_ signal
   from `FlowVersion.status` (whether THIS version is draft or
   published — `Flow.status` instead reflects "has this flow ever been
   published," staying PUBLISHED even while a newer draft version is
   being edited). Practical effect: **the Flows list page CAN show a
   real status badge per row after all** — the M5 finding blocking
   this was wrong, and `(app)/flows/page.tsx` should be revisited to
   add one using `flow.status`, now that `listFlows` genuinely returns
   it. Separately, `entryStepId` actually lives on `FlowVersion`, not
   `Flow` — move it. Fix `types/flow.ts`: add `status: FlowStatus` to
   `Flow`; move `entryStepId: string | null` to `FlowVersion`; rename
   `FlowVersion.versionNumber` to `version` (the real field name).
   `flow-builder-view.tsx`'s entry-step select currently reads
   `flow.entryStepId` — update to `currentVersion.entryStepId`.

7. ✅ **APPLIED — `types/auth.ts`, `types/enums.ts`'s
   `hasAtLeastRole`.** MEDIUM — `AuthUser.role` should be `roles`,
   plural, an array.
   `auth.schemas.ts`: `publicUserSchema.roles: z.array(roleEnum)`, and
   `rbac.ts` confirms a user can hold multiple roles simultaneously —
   access checks use the _highest-ranked_ role among the set
   (`ROLE_RANK: {VIEWER:0, EDITOR:1, ADMIN:2, OWNER:3}`,
   `hasAtLeastRole` takes the max). The M3-era guess ("probably
   singular, ranked hierarchy implies one rank per user") was
   reasonable given what was available then, but is wrong. Fix:
   `types/auth.ts`: `AuthUser.roles: TenantRole[]`. Add a
   `hasAtLeastRole` utility to `types/enums.ts` mirroring the backend's
   exact logic (rank table + `Math.max` + compare) — nothing currently
   consumes it, but the first role-gated UI (e.g. hiding Publish for
   non-ADMIN users, now cheaply possible) should use it rather than an
   equality check.
8. ✅ **APPLIED — `types/auth.ts`.** MEDIUM — `AuthTenant` was missing
   `activeModules`. The public
   tenant schema always includes it (only `notificationSettings` is
   omitted) — a real, already-available field for e.g. filtering
   sidebar nav to activated modules, previously not modeled at all.
   Fix: add `activeModules: Module[]` to `AuthTenant`.
9. ✅ **APPLIED — `types/enums.ts`, `types/flow.ts`,
   `lib/flows/format-condition.ts`,
   `step-config-forms/simple-condition-editor.tsx`.** LOW-MEDIUM —
   Several Condition/Step type gaps:
   `StepExecutionStatus` was missing `FAILED` (the real enum has 5
   values: PENDING/ACTIVE/WAITING/COMPLETED/FAILED, not 4). The
   `Condition` type was missing the `neq` operator (real schema has
   `eq | neq | gt | gte | lt | lte` as the single-value group) —
   `format-condition.ts` and `simple-condition-editor.tsx` both need
   the operator added (label: "is not"). `EsignStepConfig` /
   `IntegrationTriggerStepConfig` were typed as
   `Record<string, never>` (empty-object-only); the real schema is a
   generic `Record<string, unknown>` — narrower than reality, fix the
   type even though nothing writes to it yet. `FlowTemplate` was
   missing `stepCount: number` (real field on
   `flowTemplateSummarySchema`).
   Two inferences from M5/M6 that turned out to be **confirmed, not
   just plausible** — worth updating the hedging comments to say so:
   APPROVAL/VERIFICATION's `nextStepId` being the approved/verified
   path is stated directly in the real schema's field description for
   both (not inferred by analogy as M6's comments say); CONDITIONAL_
   BRANCH's `nextStepId` being the no-branch-matched fallback is stated
   directly in the real engine's own comment.
10. ✅ **APPLIED — `password-policy.ts`, `signup-form.tsx`,
    `api/auth/signup/route.ts`, `create-entity-form.tsx`.** LOW —
    Validation bounds narrower than reality, not
    wrong so much
    as incomplete: `password-policy.ts` needs `.max(128)` (real
    schema caps it, this app's schema didn't); signup's `tenantSlug`
    needs `min(2).max(60)` (had `min(1)`, no max); `tenantName` needs
    `min(2).max(120)` (had `min(1)`, no max); `fullName` needs
    `max(200)` (had no max); entity `displayName` needs `max(300)`.
    The BFF's own server-side re-check in `api/auth/signup/route.ts`
    was widened to match, so client and server enforce the same
    bounds rather than drifting.
11. ✅ **APPLIED — `signup-form.tsx`.** WORTH RECONSIDERING, not a
    bug: signup's client-side "select
    at least one module" requirement. The real signup schema treats
    `initialModules` as fully optional, defaulting to `[]`, and its own
    schema comment says so explicitly: "a tenant can activate modules
    later from Settings without re-onboarding." The M3-era UX choice to
    require at least one wasn't wrong, but now that this is confirmed
    as an anticipated, legitimate path rather than an edge case, the
    client-side requirement was loosened to match (the `.min(1)` zod
    check removed; copy changed from "Select at least one — you can
    add more later" to "Optional — add more later from Settings").
    The BFF route (`api/auth/signup/route.ts`) already treated this as
    optional — only the client form's copy and validation were
    stricter than the real contract.
12. ✅ **APPLIED — `lib/api/flows.ts`'s `createFlow` (added as part of
    item 5's rewrite), `(app)/flows/new/page.tsx`.** NEW
    CAPABILITY, not a fix: `POST /flows` (blank flow creation,
    `{module, name, description?}` → `FlowDetail`) exists on the real
    backend and was deliberately not built in M5 ("a blank flow with
    zero steps isn't very useful without a builder to populate it").
    M6's builder now exists, so this reasoning no longer holds.
    `/flows/new` now has a "Start from scratch instead" toggle next to
    the template-gallery heading, which reveals a small module + name
    form; submitting calls `createFlow` and routes straight into the
    M6 builder (`/flows/[flowId]/edit`) with zero steps, same as
    landing there from a freshly-cloned template draft.

None of items 1-3 were hypothetical — they were the kind of thing that
would have surfaced immediately in real usage (a broken refresh means
every returning visitor gets logged out silently; a broken add-step
means the M6 builder's headline feature fails on first use for FORM
steps and errors for every other type). **Every item in this list —
1 through 12, plus the Flows-list status-badge follow-on item 6 called
out — is now applied and verified** (`tsc`/`eslint`/`prettier` clean,
`next build` reaches the expected sandboxed-font-fetch failure and
nothing earlier). `(app)/flows/page.tsx` now renders a real
`FlowStatusBadge` per row using `flow.status`. M6 is genuinely
shippable, and so is every improvement this verification pass
surfaced. Nothing from Section 0.4 remains open.

**Next work is Milestone 7** (Section 5 below) — there is no more
backend-verification backlog blocking it.

- Items 10-12 above (validation bounds, the signup-modules UX
  reconsideration, and wiring the now-available `createFlow` into a
  "start from scratch" option on `/flows/new`).
- Then proceed to M7 (Section 5 below) as originally planned.

Whoever does this work: **checkpoint (zip the whole project to
`/mnt/user-data/outputs/`) after every single file change**, not after
each numbered item above and definitely not after a batch of them —
see this section's intro for why that discipline is the difference
between this fix list surviving and not.

---

## 1. What this project is

OnboardOS: a unified, type-adaptive onboarding platform (Employee,
Product, Client, Identity modules) with an AI flow-generation feature
as its headline differentiator — describe a flow in plain English,
review a generated draft, refine it conversationally, materialize it
as a real, human-reviewable DRAFT flow. The backend (`onboardos-backend`,
8 milestones, fully built and documented separately) implements all of
this as a REST API. This project is the frontend consuming it.

Two visual/design references informed the brand language (not literal
clones, design language only): a dashboard-style reference (search with
Cmd+K, sidebar nav, "Today's Report" stat cards) for the authenticated
app shell, and a marketing-site reference (bold navy/orange type,
pill-shaped CTAs, a step-tracker pattern) for the public site.

## 2. Stack (locked, versions verified via web search on 2026-07-19 — re-verify if picking this up much later)

- **Next.js 16.2** (App Router, Turbopack, `output: 'standalone'`, typed routes)
- **React 19.2**
- **TypeScript**, strict mode + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- **Tailwind CSS v4.3** — CSS-first `@theme`, no `tailwind.config.ts`
- **next-themes** — chosen despite being the one dependency that hasn't shipped in over a year (confirmed via search); still the standard, 22M-weekly-download choice, safer than moving to an alternative with a tiny install base based on a competitor's own marketing claims about bugs. Re-verify this tradeoff if a real React-19-specific bug surfaces in practice.
- **motion** (package name `motion`, imported from `motion/react`) — this is Framer Motion's current identity; `framer-motion` is the deprecated old name/import path.
- **TanStack Query v5.101** — not yet installed/wired (lands in M4)
- **Zod v4** — validation only, **never** for type inference (see Section 4)
- **react-hook-form** + **@hookform/resolvers**
- **lucide-react** (icons), **sonner** (toasts), **class-variance-authority** (component variants), **clsx** + **tailwind-merge** (the `cn()` helper)
- **geist** package (Geist Sans/Mono fonts) + **Space Grotesk** via `next/font/google` (display font)

**This "no `npm install`" limitation did not hold this session** — see
Section 2a immediately below before assuming it still applies.

## 2a. Verification tooling — what actually works in this sandbox (found in M2, supersedes the note above)

`npm install` reached the real registry and completed successfully
this session. Whether that's because this particular sandbox instance
has different network egress than the one M1 ran in, or because
network access is simply variable session-to-session, is unknown —
**don't assume either way; just try it early**, the way this session
did, rather than defaulting to the syntax-only verification method.

Two version pins didn't resolve as published and needed adjusting —
exactly the "minor dependency-resolution issue or two" this document
already anticipated, now with the specifics:

- `@types/react-dom@^19.2.7` → no matching version exists (the
  package tops out lower than `react-dom` itself did); loosened to
  `^19.2.5`.
- `prettier-plugin-tailwindcss@^0.6.16` → never existed on the
  registry at all (0.6.x tops out at `.14`); bumped to `^0.8.1`, the
  current major — safe, since it's a dev-only formatting plugin.

With install working, `tsc --noEmit` and `eslint . --max-warnings=0`
both run for real (not the syntax-only TS-compiler-API check M1 used).
That surfaced — and this session fixed — several genuine issues the
lighter check couldn't have caught:

- Three real `exactOptionalPropertyTypes` errors in M1 code
  (`theme-toggle.tsx`'s array-index lookup, `branded-loading-screen.tsx`
  and `spinner.tsx`'s conditionally-`undefined` Motion props) — all
  fixed by narrowing/restructuring, not by loosening tsconfig.
- `eslint.config.mjs` crashed outright (a circular-JSON error) run for
  real: `eslint-config-next@16.2.10` now ships **native flat-config
  exports** (`eslint-config-next/core-web-vitals`,
  `eslint-config-next/typescript`), and routing them through the old
  `FlatCompat`/`@eslint/eslintrc` bridge — correct for older versions,
  and what this file used to do — breaks against this version's plugin
  graph. Fixed by importing the native exports directly (confirmed
  against Next's own current docs) and dropping the now-unnecessary
  `@eslint/eslintrc` dependency entirely.
- `typescript-eslint`'s own `config()` wrapper is now deprecated in
  favor of ESLint core's `defineConfig()` (from `eslint/config`) — the
  outer wrapper in `eslint.config.mjs` was switched accordingly; it
  still flattens nested arrays like `tseslint.configs.strictTypeChecked`
  the same way.
- `eslint-plugin-react-hooks` (now major version 7) added a
  `set-state-in-effect` rule aggressive enough to flag the standard
  next-themes hydration-safe "mounted" guard — a pattern React's own
  docs and next-themes' own docs use, and a tracked, unconfirmed
  over-trigger of the rule itself (`facebook/react#34743`), not a real
  anti-pattern. Suppressed with a reasoned comment at that one call
  site rather than restructured away. The **same rule correctly
  flagged a real instance** in M2's own `SiteHeader` (closing the
  mobile nav on route change via a plain `setState`-in-effect) — fixed
  properly there, using React's documented "adjust state during
  render" pattern instead of an effect. Don't blanket-disable this
  rule; it earned its keep once already.
- Zod 4's `.string().email()` is deprecated in favor of the top-level
  `z.email()` — both call sites in M2's contact form updated.

`npx prettier --write .` was run once across the entire M1+M2 tree —
it reformatted every file that predates this session (none had ever
actually been run through Prettier before), plus everything M2 added.
Re-run `npm run format` before trusting a raw diff against this repo
for style noise.

**One real, sandbox-specific limitation remains:** `next build` cannot
fully complete here — `fonts.googleapis.com` isn't in this sandbox's
network allowlist, and the root layout's `Space_Grotesk` import via
`next/font/google` fails to fetch (a 403, not a hang). This is
**not** a code defect — don't "fix" it by changing the font choice,
which is a deliberate brand decision. Useful side effect: Turbopack's
route-scanning step runs and writes `.next/types/routes.d.ts`
_before_ it reaches the font import, so `timeout 90 npx next build`
(accept the failure) followed by `npx tsc --noEmit` gives full,
real `typedRoutes`-aware type-checking of every `<Link href>` in the
app — this is how M2's routing was verified, and is worth doing again
any time new routes are added.

## 3. Architecture decisions already made

**Auth pattern (design locked, implementation lands in M3):** access
token in memory only (React context, never `localStorage`/`sessionStorage`).
Refresh token in an httpOnly, Secure, SameSite=Lax cookie, set by a thin
Next.js Route Handler BFF that proxies only `login`/`signup`/`refresh`/`logout`
to the backend. Business API calls go directly from client components to
the backend with a bearer header once bootstrapped. Requires zero
backend changes. The Super Admin surface needs a SECOND, entirely
separate instance of this same pattern — platform-admin tokens and
tenant tokens are mutually exclusive by construction on the backend
(see Section 4).

**Design tokens:** two-layer CSS custom property system in
`globals.css` — raw OKLCH palette, then semantic tokens
(`--primary`/`--background`/etc.) redefined per theme. Every color in
every component traces back to one of these two layers; enforced by
`eslint.config.mjs`, not just discipline. Three narrow, documented,
unavoidable exceptions exist (OS-level theme-color meta, standalone
favicon, manifest/apple-icon) — see the README, not repeated here.

**Type conventions:** `z.infer<...>` is banned by lint rule, everywhere.
Every type the app consumes is hand-written, kept next to (never
derived from) whatever Zod schema might exist for runtime validation.
When building API-consuming code in M3+, this means: for every backend
response shape in Section 4 below, write an explicit TypeScript
`interface` in `src/types/` — do not import or infer from any Zod
schema, even if it would be faster.

**Component variant pattern:** `class-variance-authority` (`cva`) for
every component with visual variants (Button, Badge so far). Export the
`*Variants` function standalone alongside the component itself, so a
`<Link>` or other non-button element can apply identical classes
without needing a Slot/`asChild` dependency (deliberately not added —
keeps the primitive-component dependency surface minimal until a real
need for full compound-component composition arises).

## 4. Backend API surface — the full contract this app consumes

Base path `/v1` unless noted. RBAC: tenant roles are a ranked hierarchy
(`OWNER > ADMIN > EDITOR > VIEWER`, "at least this rank" checks).
Platform-admin roles are an ALLOW-LIST per route, not ranked
(`SUPPORT | COMPLIANCE | ENG_ON_CALL | REVOPS | SUPER`) — a platform
admin's token is structurally rejected by every tenant route, and a
tenant user's token is structurally rejected by every `/admin` route.
Two completely separate identity spaces; the FE needs two completely
separate auth contexts to match.

**Verification status per subsection, updated after a session with
real backend source access (see Section 0):** Auth, Entities, Flows,
Steps, and Conditions below are now **verified against real source**
(specific files cited inline) — no longer "reconstruction from
memory" for those. Enrollments, Verification/KYC, AI Flow Drafting,
and Super Admin were **not** re-checked against source this session —
AI Flow Drafting's detail below happens to check out against what was
independently found this session (encouraging, but it means it was
never disproven, not that every field was individually re-verified
line by line), while Enrollments/Verification/Super-Admin remain
exactly the same "careful reconstruction from memory, verify before
trusting" status they always had. Don't treat "wasn't flagged as
wrong" as the same thing as "confirmed."

**Enums that matter across the whole app:**

- `Module`: `EMPLOYEE | PRODUCT | CLIENT | IDENTITY`
- `StepType`: `CONTENT | FORM | TASK | ESIGN | APPROVAL | VERIFICATION | INTEGRATION_TRIGGER | CONDITIONAL_BRANCH`
- `FlowStatus`: `DRAFT | PUBLISHED | ARCHIVED` — used by BOTH `Flow.status` and `FlowVersion.status`, which are NOT the same signal — see the Flows section below.
- `FlowCreatedVia`: `MANUAL | TEMPLATE | AI`
- `EnrollmentStatus`: `ACTIVE | COMPLETED | FAILED | CANCELLED`
- `StepExecutionStatus`: `PENDING | ACTIVE | WAITING | COMPLETED | FAILED` — **verified 5 values, not 4** (`FAILED` was missing from this doc and from this app's `types/enums.ts` until Section 0.4's fix).
- `VerificationSessionStatus`: `PENDING | APPROVED | DECLINED | NEEDS_REVIEW | EXPIRED`
- `VerificationProvider`: `PERSONA | VERIFF | MOCK`
- `TenantRole`: `OWNER | ADMIN | EDITOR | VIEWER` — verified rank order (`src/modules/auth/rbac.ts`): `VIEWER=0, EDITOR=1, ADMIN=2, OWNER=3`.
- `PlatformAdminRole`: `SUPPORT | COMPLIANCE | ENG_ON_CALL | REVOPS | SUPER`
- `EntityRelationshipType`: `STAKEHOLDER_OF | EMPLOYEE_OF | OWNS`

### Auth (`/v1/auth/*`, `/v1/tenants/me/settings`) — verified (`src/modules/auth/auth.schemas.ts`, `rbac.ts`)

- `POST /auth/signup` — `{ tenantName (2-120 chars), tenantSlug (2-60 chars, `^[a-z0-9-]+$`), email, password (12-128 chars, needs upper+lower+digit — exact rule, not approximated), fullName (1-200 chars), initialModules? }` → `{ user, tenant, tokens: { accessToken, refreshToken, expiresInSeconds } }`. `initialModules` genuinely optional, defaults `[]` — the schema's own comment confirms a tenant can activate modules later without re-onboarding, so don't treat zero-modules-at-signup as an edge case. `tenant` never includes `notificationSettings` (write-only elsewhere) but DOES include `activeModules: Module[]` and `brandingTheme` (not yet consumed by this app; a real field for future white-label work).
- `POST /auth/login` — `{ email, password, tenantSlug }` → same shape as signup.
- `POST /auth/refresh` — `{ refreshToken }` → `{ tokens: { accessToken, refreshToken, expiresInSeconds } }` (rotated). **Corrected this session — the response nests under `tokens`, exactly like login/signup; it is NOT flat the way an earlier version of this doc (and this app's code) assumed.**
- `POST /auth/logout` — `{ refreshToken }` → 204.
- `GET /auth/me` — → `{ user, tenant }`, where `user.roles: TenantRole[]` — **confirmed an array**, not a single rank (a user can hold more than one role; access checks use the highest rank among the set, via `hasAtLeastRole`).
- `PATCH /tenants/me/settings` (ADMIN+) — `{ notificationSettings?: { slackWebhookUrl?: string | null } }` → `{ notificationSettings: { slackWebhookConfigured: boolean } }` (write-only, never echoes the secret back).

### Entities (`/v1/entities/*`) — verified (`src/modules/entities/entities.schemas.ts`)

- `POST /entities` (EDITOR+) — `{ type: 'PERSON'|'ACCOUNT', displayName (1-300 chars), attributes? }` → Entity.
- `GET /entities` (VIEWER+) — `?type=&limit= (1-100, default 20)&cursor=` → `{ entities, nextCursor }` (keyset pagination via ULID ordering).
- `GET /entities/:entityId` (VIEWER+) → Entity.
- `POST /entities/:entityId/relationships` (EDITOR+) — `{ childEntityId, relationshipType }` → EntityRelationship. Direction convention confirmed exactly: the row means "childEntityId `<relationshipType>` parentEntityId" — the URL's `:entityId` is the PARENT.
- `GET /entities/:entityId/relationships` (VIEWER+) → `{ asParent: [...], asChild: [...] }`.

### Flows (`/v1/flows/*`, `/v1/flow-templates`) — verified (`src/modules/flows/flows.routes.ts`, `flows.schemas.ts`, `src/db/schema/onboarding.schema.ts`)

- `POST /flows` (EDITOR+) — `{ module, name (1-200 chars), description? (max 2000) }` → 201 `{ flow, currentVersion, steps: [] }`. Creates a blank flow with an empty draft version — not yet built into this app's UI (M5 skipped it, reasonably, before a builder existed to populate it; M6 now exists, so this is a real, cheap, currently-missing "start from scratch" option — see Section 0.4 item 12).
- `GET /flows` (VIEWER+) — `?module=&status=` → `{ flows }`, where **each `Flow` includes its own `status: FlowStatus`** (whether this flow has EVER been published — sticky through PUBLISHED even while a newer draft version is being edited, only moving to ARCHIVED explicitly). This is a DIFFERENT signal from `FlowVersion.status` (DRAFT/PUBLISHED — whether the specific version is live). **An earlier version of this doc, and this app's M5 code, wrongly assumed `Flow` had no status field at all and built the Flows list page around that assumption — it was wrong; the list page can and should show a real per-row status badge using `flow.status`.**
- `GET /flows/:flowId` (VIEWER+) → `{ flow, currentVersion, steps }` — steps always ordered by `position` ascending. `currentVersion` includes `entryStepId: string | null` (lives here, NOT on `flow`) and `version: number` (the real field name — not `versionNumber`).
- `PATCH /flows/:flowId` (EDITOR+) — `{ name?, description?, entryStepId? }` → 200, the FULL `{ flow, currentVersion, steps }`, not a bare Flow.
- `POST /flows/:flowId/draft` (EDITOR+) → 200 `{ flow, currentVersion, steps }` — ensures an editable draft exists (clones the published version if needed, with a NEW set of step ids).
- `POST /flows/:flowId/steps` (EDITOR+) — discriminated union body on `type`, **every step type requires `key`** (a stable, lowercase `^[a-z][a-z0-9_]*$` identifier, 1-60 chars, used ONLY for condition-path references like `steps.<key>.output.field` — completely separate from `id`, which is what `nextStepId`/`onRejectStepId` reference; immutable after creation) → 201 `Step`. 409 if the flow's latest version is published (call `draft` first).
- `PATCH /flows/:flowId/steps/:stepId` (EDITOR+) — `{ title?, position?, config?, nextStepId? }` (no `key` — confirmed immutable) → 200 `Step`.
- `DELETE /flows/:flowId/steps/:stepId` (EDITOR+) → 204, no body.
- `POST /flows/:flowId/publish` (ADMIN+ — a real, higher bar than every other write here) — validates entry step + every reference resolves before publishing → 200, **only the updated `FlowVersion`, not the full flow detail** (an earlier version of this doc didn't specify a response shape here at all; this app's code wrongly assumed the full detail — see Section 0.4 item 4).
- `GET /flow-templates` (VIEWER+) — `?module=` → `{ templates: [{id, module, name, description, stepCount}] }` — built-in starter flows (Employee/Product/Client). `stepCount` is a real field, previously missing from this doc and this app's `FlowTemplate` type.
- `POST /flows/from-template` (EDITOR+) — `{ templateId }` → 201, the full flow detail, always DRAFT.
- `POST/GET/PATCH/DELETE /flows/:flowId/triggers` (ADMIN+ for writes) — cross-module triggers: on `sourceEvent` (`ENROLLMENT_COMPLETED`/`FAILED`), auto-enroll a resolved entity into `targetFlowId`. Not re-verified this session.
- `GET /flows/:flowId/enrollments` (VIEWER+) — cross-entity visibility into one flow. Not re-verified this session.

**Step config shapes** (verified exact — `src/modules/workflow/workflow.types.ts` — this is what the flow builder, M6, renders forms for):

```
CONTENT:  { body: string, readReceiptRequired?: boolean, displayMode?: 'PAGE'|'MODAL'|'TOOLTIP'|'SLIDEOUT'|'BANNER' }
FORM:     { fields: [{ key, label, type: 'TEXT'|'SELECT'|'CHECKBOX'|'DATE', required?, options?: string[] }] }
          // fields REQUIRES min 1 — a brand-new FORM step with an empty
          // fields array fails creation outright. Each field's own
          // `key` is required too (same 1-60-char format as step keys).
TASK:     { assigneeRole?: 'MANAGER'|'BUDDY'|'IT'|'HR'|'OWNER'|'ADMIN', instructions?: string (max 2000) }
APPROVAL: { onRejectStepId: string | null }
          // the step's own nextStepId is the APPROVED path — this is
          // CONFIRMED directly in the real schema's field description,
          // not inferred by analogy (an earlier version of this doc
          // and this app's comments correctly guessed this but hedged
          // it as inferred; it no longer needs to be hedged).
VERIFICATION: { provider: 'PERSONA'|'VERIFF'|'MOCK', providerTemplateId?: string, onRejectStepId: string | null }
          // same confirmed (not inferred) approved/rejected split as APPROVAL
CONDITIONAL_BRANCH: { branches: [{ when: Condition, nextStepId: string }] }
          // the step's own nextStepId is the CONFIRMED fallback when no
          // branch matches — stated directly in the real engine's own
          // comment, not inferred.
ESIGN, INTEGRATION_TRIGGER: Record<string, unknown>
          // a real, generic (not empty-only) schema — nothing currently
          // writes meaningful data here, but the type shouldn't claim
          // it's restricted to {} when the backend doesn't restrict it.
```

**Condition AST** (verified exact — `src/modules/workflow/condition.ts` — the flow builder's branch editor renders THIS, never a code box):

```
{ op: 'eq'|'neq'|'gt'|'gte'|'lt'|'lte', path: string, value: unknown }
| { op: 'in'|'nin', path: string, values: unknown[] }
| { op: 'exists'|'notExists', path: string }
| { op: 'and'|'or', conditions: Condition[] }
| { op: 'not', condition: Condition }
```

`path` is a dot-path into the enrollment context, typically
`entity.attributes.<fieldName>` (confirmed directly in the real
evaluator's own comment). `neq` was missing from an earlier version of
this doc. `value`/`values` are genuinely `unknown` on the backend
(any JSON-serializable value) — this app's own types narrow them to
`string | number | boolean` deliberately, since a visual editor can't
reasonably author an arbitrary nested value; that narrowing is a
frontend UX choice, not a backend fact, and display code reading a
condition from elsewhere should degrade gracefully rather than assume
the narrower type always holds.

### Enrollments (`/v1/entities/:id/enrollments`, `/v1/enrollments/*`) — NOT re-verified this session, still reconstruction from memory

- `POST /entities/:entityId/enrollments` (EDITOR+) — `{ flowId }` → Enrollment. Resolves to the flow's CURRENT PUBLISHED version.
- `GET /enrollments/:enrollmentId` (VIEWER+) → `{ enrollment, stepExecutions }`.
- `POST /enrollments/:enrollmentId/steps/:stepExecutionId/complete` (EDITOR+) — `{ output: Record<string, unknown> }` → `{ enrollment, stepExecutions }`. For APPROVAL/VERIFICATION steps specifically, `output` MUST include `{ decision: 'approved' | 'rejected', notes?: string }`.

`StepExecution` has an `output` field (written once, at completion) AND a separate `metadata` field (in-flight data available WHILE the step is still `WAITING` — e.g. a verification session's `redirectUrl`). Don't conflate the two when building the enrollment detail view (M8). The one thing about this section confirmed as a side effect of this session's Flows investigation: `listEnrollmentsQuerySchema`/`listEnrollmentsResponseSchema` do exist scoped to one flow (`GET /flows/:flowId/enrollments`, listed above) — there's still no tenant-wide enrollments list endpoint.

### Verification / KYC (`/v1/verification-*`, `/v1/webhooks/verification/*`) — NOT re-verified this session, still reconstruction from memory

- `PUT /verification-providers/:provider` (ADMIN+) — `{ apiKey, webhookSecret, isActive? }` → `{ provider, isActive, webhookUrl }`. Write-only, same pattern as tenant settings.
- `GET /verification-providers` (VIEWER+) → list, never includes secrets.
- `GET /verification-sessions` (VIEWER+) — `?status=&stepExecutionId=&limit=&cursor=` — `status=NEEDS_REVIEW` is the manual-review queue view.
- `GET /verification-sessions/:sessionId` (VIEWER+).
- `POST /verification-sessions/:sessionId/manual-decision` (EDITOR+) — `{ decision, notes? }` — resolves a `NEEDS_REVIEW` case.
- `POST /verification-sessions/:sessionId/request-reverification` (EDITOR+) — starts a fresh session for the same step (the "false rejection" recovery path).
- `POST /verification-sessions/:sessionId/simulate-webhook` (EDITOR+, **MOCK provider sessions only**) — useful for a "try it without a real KYC partner" demo mode in the FE.

### AI Flow Drafting (`/v1/flow-drafts/*`) — the headline feature, build this with real care in M7 — independently checked this session, not contradicted by anything found (see Section 4's header note on what that does and doesn't mean)

- `POST /flow-drafts` (EDITOR+, rate-limited 20/hour **per-tenant**, not per-IP) — `{ module, description, priorDraft?, refinementInstruction?, refinementOfGenerationId? }` → `202 { jobId, status: 'queued', pollUrl }`. Async — this is a real BullMQ job on the backend, not a synchronous call. For a REFINEMENT turn (not the first generation), all three of `priorDraft` + `refinementInstruction` + `refinementOfGenerationId` must be present together.
- `GET /flow-drafts/:jobId` (EDITOR+) → `{ status: 'PENDING'|'COMPLETED'|'FAILED', generationId?, draft?, repaired?, errorMessage? }`. Poll this. `repaired: true` means the model's first response failed validation and one automatic backend-side repair round-trip was needed — worth surfacing in the UI as a small "double-checked this one" signal, not hiding it.
- `POST /flow-drafts/materialize` (EDITOR+) — `{ module, draft, generationId }` → `201 flowDetailResponse`. Always lands as DRAFT. Re-validates server-side regardless of what the FE sends. 409 if that `generationId` was already materialized once (idempotency guard — don't let a double-click silently create two flows).

**`AiFlowDraft` shape** — structurally identical to how the backend's own built-in templates work internally: `{ name, description?, entryStepKey, steps: AiFlowDraftStep[] }`. Steps reference each other by `key` (a string), never a real id — nothing is persisted until `materialize` is called. Each step: `{ type, key, title, position, config, nextStepKey? }`.

**The one genuinely easy mistake to make here**: inside a `CONDITIONAL_BRANCH` step's `config.branches[].nextStepId` and inside `APPROVAL`/`VERIFICATION`'s `config.onRejectStepId`, the field is still literally named `nextStepId`/`onRejectStepId` — NOT renamed to `*Key` — even though the VALUE stored there is a step `key` string at this pre-materialization stage, not a real id. This is carried over verbatim from the backend's own schema (`AiFlowDraft`'s config fields reuse the exact same Zod schemas manual step authoring uses). Getting this field name wrong when building the draft-preview/edit UI will silently break branch/reject-path rendering.

**Consequence for reusing M6's components in M7 (see Section 5's M7 note for the full version):** `StepSummaryCard`'s `stepTitleById: Map<string, string>` resolves references by real step `id` — a draft, before materialization, has no real ids, only `key`s. Reusing it for the draft preview needs a `key`-keyed lookup map instead, not a drop-in reuse.

### Super Admin Dashboard (`/v1/admin/*`) — separate auth entirely, build as its own isolated section (M9) — verified against real backend source (session after M8): `src/modules/platform-admin/*.{routes,schemas,service}.ts`, `src/db/schema/platform-admin.schema.ts`, `src/db/schema/feature-flags.schema.ts`

**The one thing to get right before anything else: platform-admin
roles are an ALLOW-LIST per route, not the tenant app's "at least this
rank" model.** `PlatformAdminRole = 'SUPPORT' | 'COMPLIANCE' |
'ENG_ON_CALL' | 'REVOPS' | 'SUPER'` has no ordering among the first
four — each is a non-overlapping specialist slice, and `SUPER` is a
superset included automatically on every route's allow-list, not the
top of a rank the others sit below (`platform-admin.rbac.ts`'s own
header comment is explicit about this, and `platform-admin.schema.ts`
independently repeats the same warning). **Do not reuse
`hasAtLeastRole` for this.** The FE needs its own allow-list-style
check (`hasAnyPlatformRole(role, allowed)` or similar) that
auto-includes `SUPER`, mirroring `requirePlatformRole(...allowed)`
exactly — a rank-based check here would silently grant or deny the
wrong roles since there is no real ordering to rank by.

- `POST /admin/auth/login` — `{ email, password }`, **no** `tenantSlug`
  — → `{ admin: PlatformAdmin, accessToken, expiresInSeconds }`. Rate
  limited (10/minute). **No refresh token at all** — confirmed in
  `platform-admin-auth.service.ts`'s own header comment: platform-admin
  sessions are deliberately short-lived, re-login on expiry rather than
  silent extension, trading session length for removing an entire class
  of long-lived-credential risk from the identity space with the
  broadest cross-tenant reach in the system. **FE consequence: there is
  no BFF proxy route and no httpOnly cookie for this at all** — M3's
  whole reason for proxying tenant login through `/api/auth/*` was to
  keep the refresh token server-side; with no refresh token to protect,
  admin login can (and does) call the backend directly from the client,
  exactly like every ordinary business API call already does via
  `lib/api/client.ts`. It also means a hard page reload on `/admin/*`
  always logs the admin out — there is nothing to silently restore
  from, by design, not a bug to fix later.
- `GET /admin/auth/me` → `PlatformAdmin` directly (not wrapped).
  `PlatformAdmin` (`publicPlatformAdminSchema`, passwordHash omitted):
  `{ id, email, fullName, role: PlatformAdminRole, isActive, lastLoginAt:
string | null, createdAt, updatedAt }`.
- `POST /admin/platform-admins` (SUPER only) — `{ email, password (12-128
chars, needs upper+lower+digit), fullName (1-200 chars), role }` →
  201 `PlatformAdmin`. **Confirmed to exist but deliberately excluded
  from M9's UI** — not called for by this section's own M9 roadmap note
  (impersonation / feature flags / tenant health / module override /
  activity viewer only), so this is a real boundary, not a gap, the
  same way M8 left verification-provider credential config out of
  scope. Bootstrapping the very first SUPER admin is a seed script
  (`src/db/seed-platform-admin.ts`), not an FE concern at all.
- `POST /admin/impersonate` — gated to **SUPPORT only** (SUPER always
  included automatically by the allow-list wrapper).
  **`ENG_ON_CALL` is deliberately excluded** — flagged in the route's
  own comment as a real product decision from the Milestone 6 review,
  not an oversight: during an incident, on-call's path to a customer's
  data is escalating to Support for a grant (or reading audit/log data
  directly, which needs no impersonation at all), not self-serve
  impersonation. The FE must gate the impersonate action to
  SUPPORT/SUPER specifically, not "any admin," and specifically not
  ENG_ON_CALL even though that role can see the activity log (next
  item). Request: `{ tenantId, userId?, reason }` — `reason` is 10-500
  chars, required, written verbatim into the audit log; `userId`
  omitted defaults to the tenant's OWNER (the endpoint 400s if that
  tenant has no OWNER user, asking for an explicit `userId` instead) —
  the FE's form should say so in the field's own helper text rather
  than requiring a user id up front. Response: `{ accessToken,
expiresInSeconds, impersonatedUser, impersonatedTenant }` — **no
  refresh token here either** (an impersonation grant expires with the
  access token and cannot be silently extended; needing more time means
  calling this again, which means another audit entry with another
  reason — intentional friction). `impersonatedUser`/`impersonatedTenant`
  are `publicUserSchema`/`publicTenantSchema` — **the exact same shapes
  as this app's own `AuthUser`/`AuthTenant`** (`@/types/auth`), reusable
  directly rather than inventing parallel types. The returned
  `accessToken` is a **normal tenant-kind JWT** — every existing tenant
  route and every existing `lib/api/*` client function works with it
  completely unmodified; the only FE-side work is routing this token
  through the ordinary tenant `apiFetch`/auth-bridge machinery (not the
  admin one) for the duration of the impersonation session, and
  rendering the persistent "You are impersonating X" banner called for
  below for as long as that token is in use.
- `GET /admin/impersonation-activity` — gated to **SUPPORT, COMPLIANCE,
  ENG_ON_CALL** (+ SUPER). **`REVOPS` is excluded** — narrower than
  feature-flags/tenant-health's all-four-roles read access, so the nav
  link for this page must check the admin's actual role, not just
  "logged in." Query: `{ tenantId?, platformAdminId?, limit (1-200,
default 50) }`. Response: `{ entries: ImpersonationAuditEntry[] }`
  where each entry is a **raw `audit_log` row**, not a purpose-built DTO:
  `{ id, action, tenantId: string | null, actorPlatformAdminId: string |
null, targetType: string | null, targetId: string | null, metadata:
string | null, createdAt }`. **`metadata` is a JSON-encoded STRING, not
  an object** — parse it client-side defensively (`try { JSON.parse(...)
} catch`), the same shape-gotcha category as M7's draft `key` vs `id`
  or M5's Condition AST, just here it's "stringified JSON, not a
  dictionary" rather than "the wrong identifier field." One query
  surfaces both the `platform_admin.impersonation_started` entry (its
  `metadata` carries the `reason` and `impersonatedRoles`) and every
  subsequent `platform_admin.impersonated_request` entry a global audit
  hook writes for each request made under that grant — the FE can
  render both under one list without a second endpoint.
- `GET /admin/feature-flags` — gated to **all four of `ENG_ON_CALL,
REVOPS, SUPPORT, COMPLIANCE`** explicitly (+ SUPER) — i.e. genuinely
  every platform admin role can read, not just "broadly allowed" as a
  vague default. `?tenantId=` mixes that tenant's `TENANT`-scoped
  overrides into the same flat `flags` array alongside every `GLOBAL`
  flag — **the response does not pre-group them**; the FE distinguishes
  scope per-row from each flag's own `scope`/`tenantId` fields (e.g. a
  "Global" vs "Override for &lt;tenant&gt;" badge per row).
- `PUT /admin/feature-flags` — **`ENG_ON_CALL` only** (+ SUPER). A true
  upsert keyed on `(key, scope, tenantId)` — calling it again with the
  same key/scope/tenant updates the existing row rather than
  conflicting, so one form serves both "create" and "edit" with no
  separate code path. Request: `{ key (1-100 chars, regex
`^[a-z][a-z0-9_.]*$`— lowercase snake_case or dot.separated, e.g.`ai_flow_generation`or`module.client.beta`), scope: 'GLOBAL' |
'TENANT', tenantId?: string (required iff TENANT, must be omitted iff
GLOBAL — the FE form should enforce this the same way the backend's
`.refine()` does, not just rely on the 400), isEnabled: boolean,
description?: string (max 500) }` → 200 `FeatureFlag`.
- `DELETE /admin/feature-flags/:flagId` — **`ENG_ON_CALL` only** (+
  SUPER) → 204, no body. `FeatureFlag`
  (`featureFlagSchema`/`FEATURE_FLAG_SCOPE_VALUES = ['GLOBAL',
'TENANT']`): `{ id, key, scope, tenantId: string | null, isEnabled,
description: string | null, createdAt, updatedAt }`.
- `GET /admin/tenants` / `GET /admin/tenants/:id` — gated to the same
  all-four-roles-plus-SUPER pattern as feature flags (`SUPPORT, REVOPS,
COMPLIANCE, ENG_ON_CALL`). List is cursor-paginated: `{ module?:
Module, limit (1-100, default 20), cursor? }` → `{ tenants:
TenantHealthSummary[], nextCursor: string | null }`, always ordered by
  `tenantId` ascending (ULID order = creation order, safe to paginate
  without re-sorting). **The detail endpoint returns the exact same
  `TenantHealthSummary` shape as each list row** — not a richer
  drill-down with a user list or flow list — so list and detail share
  one type, and the "detail page" is honestly just a single-tenant view
  of the same summary, nothing more, same honesty-about-scope the M8
  enrollments-list gap got. `TenantHealthSummary`
  (`tenantHealthSummarySchema`): `{ tenantId, tenantName, tenantSlug,
activeModules: Module[], userCount, flowCount, entityCount,
activeEnrollmentCount, createdAt }`.
- `PUT /admin/tenants/:tenantId/modules` — **`REVOPS` only** (+ SUPER).
  Request: `{ activeModules: Module[], reason (10-500 chars, required) }`
  — **REPLACES the full list, not a diff/patch** (the FE's module
  picker should be a true multi-select reflecting the complete desired
  set, not an add/remove delta). Response: `{ tenantId, activeModules }`
  always shows the complete resulting set, so there's no ambiguity
  about what changed.
- All of the above are registered under the same `/v1` prefix as every
  other module (`/v1/admin/auth/login`, `/v1/admin/tenants`, etc.) —
  abbreviated here the same way the rest of this section abbreviates
  paths.

## 5. Milestone plans and retrospectives — M2 through M10 (all complete)

### M2 — Marketing site + legal (public, unauthenticated) — COMPLETE

Built: Home (hero + the AI showcase described below, modules grid,
how-it-works teaser, feature highlights, closing CTA), How it works
(full 6-step lifecycle + the same live showcase + "one engine, four
contexts"), Modules overview + a dynamic `/modules/[module]` detail
page (`generateStaticParams`/`generateMetadata` per module,
`dynamicParams = false` since it's a fixed set of four, not
user-generated content), Pricing (3 tiers + a short FAQ teaser), About
(mission/principles — no fabricated founder names, dates, or funding
details), FAQ (15 questions, native `<details>/<summary>` — no
Accordion primitive needed), Contact (a real validated form —
react-hook-form + zodResolver — posting to `api/contact/route.ts`,
which is a **documented gap**: no email/CRM delivery is wired up yet,
Resend/Postmark/a real backend contact endpoint are all reasonable
follow-ups; the route validates and logs every real submission so
nothing's silently lost meanwhile, and a honeypot field is checked
both client- and server-side), and all three Legal pages (Privacy,
Terms, Cookies — real, specific, standard-form content grounded in
what this product actually does, e.g. the Cookie policy names the
_one_ real cookie — the httpOnly session cookie — and correctly notes
theme preference is `localStorage`, not a cookie; Terms' governing-law
section is left as an explicit `[bracketed placeholder]`, not a
fabricated jurisdiction). **Pricing figures are illustrative
placeholders pending a real business decision, not researched
numbers.** **All legal copy is a reasonable draft, not a substitute
for real counsel review before launch.**

Other decisions made along the way:

- **The AI flow-generation showcase**
  (`components/marketing/flow-generation-showcase.tsx`) is the
  "first-class marketing moment" this section originally called for —
  plays once on scroll into
  view (`whileInView`, not an infinite loop), reuses the Employee
  module's own `exampleSteps` data (so the demo and the Employee
  module page can't drift apart on what they claim the product does),
  and is honest about being illustrative rather than a simulated live
  API call. Reused as-is on the How It Works page.
- **`/login` and `/signup` got minimal placeholder pages** (under a
  new `(auth)` route group, with a minimal real layout, both marked
  clearly as M3 stubs in their own comments) — needed because
  `typedRoutes` rejects a `<Link href>` to a route that doesn't exist
  yet, and this is the exact same pattern M1's own placeholder
  `page.tsx` already established for the root route. M3 should expand
  these in place, not move the files.
- **A new `--inverse`/`--inverse-foreground` token pair** was added to
  `globals.css` for the bold navy CTA band the reference brand
  language calls for — deliberately fixed across both themes (unlike
  `--navy`, which inverts in dark mode), since the band is meant to
  read as one consistent brand moment. Commented at both the
  definition and the (deliberate) absence of a `.dark` override.
- `src/app/icon.svg` **was missing from the M1 bundle** despite being
  referenced by `layout.tsx` and `manifest.ts`, and despite the M1
  README claiming it as done — likely lost in one of that session's
  sandbox resets and not caught by a file-count check alone
  (`27 source files` only ever counted `.ts`/`.tsx`, never the `.svg`).
  Created now, matching `LogoMark`'s design with the same literal
  `--palette-orange-600` value as the other three documented
  exceptions. **Lesson for future sessions:** a recovered file
  _count_ matching expectations doesn't guarantee the recovered file
  _set_ does — worth an explicit filename diff against what should
  exist, not just a count, after any reset.
- `sitemap.ts` now has a real entry per page (reusing the `MODULES`
  data for the four module-detail URLs rather than hardcoding slugs
  twice), each with a considered `changeFrequency`/`priority` rather
  than a copy-pasted default. `/login`/`/signup` are deliberately
  excluded — they're about to be replaced, not worth indexing yet.
- A new shared `fieldError()` helper (`lib/utils.ts`, next to `cn()`)
  papers over a real, structural friction between react-hook-form's
  `errors.field?.message` (typed `string | undefined`) and this
  project's `exactOptionalPropertyTypes` + optional-prop convention
  (`Field`'s `error?: string`). **M3's login/signup forms will hit
  this exact same issue** — use it rather than re-deriving the fix.

### M3 — Auth — COMPLETE

Built: Login and Signup pages (real forms, react-hook-form + Zod), the
BFF route handlers (`/api/auth/login`, `/signup`, `/refresh`,
`/logout`), an `AuthProvider` (in-memory access-token React context +
bootstrap-on-load silent refresh via `/api/auth/refresh`), a
`proxy.ts` (see note below) doing optimistic cookie-presence redirects,
and a minimal `(app)` route group (layout + a placeholder `/dashboard`)
so the whole loop lands somewhere real and testable rather than a 404.

**Judgment calls made, since Section 4's Auth contract needed
reconciling in a couple of spots:**

- **The BFF route is named `/api/auth/refresh`, not `/api/auth/session`**
  as this M3 bullet originally said — Section 3's own architecture
  decision says "refresh" and maps directly to the backend's actual
  `POST /auth/refresh` endpoint name; "session" appears to have been
  this document's own looser shorthand in one place, not a real second
  endpoint. Went with the more precise, backend-aligned name.
- **The password rule is a documented reconstruction, not a verified
  fact** — this bullet's own "min 12 chars, mixed case, etc." is
  already partial ("etc."), and Section 4 as a whole says to verify
  against the real backend source when available. The full rule this
  build uses — 12+ characters, one uppercase, one lowercase, one
  number — lives in exactly one place, `lib/auth/password-policy.ts`,
  used by the signup form, the signup route handler's server-side
  re-check, and the live checklist UI. If the real rule differs,
  that's the only file that needs correcting.
- **`AuthUser.role` is a single `TenantRole`, not an array** — Section
  4 annotates `GET /auth/me`'s response as "user (+roles)" (plural),
  but separately describes tenant roles as "a ranked hierarchy... at
  least this rank checks," which implies one rank per user. Modeled as
  singular on that reading; `types/auth.ts` flags exactly what would
  need to change if the real backend does return a set.
- **`/auth/refresh`'s response doesn't include `user`/`tenant`**
  (Section 4 is explicit about this — unlike login/signup's response).
  `lib/auth/backend-auth.ts`'s `refreshWithBackend` calls `/auth/me`
  immediately after rotating the token specifically to normalize this
  back to the same shape login/signup produce, so `AuthProvider` never
  has to know refresh is different underneath.

**Other things worth knowing:**

- **`middleware.ts` doesn't exist in this codebase — it's `proxy.ts`.**
  Next.js 16 deprecated and renamed the file convention
  (`export function middleware` → `export function proxy`) partway
  through this session; `next build` surfaced the deprecation warning,
  confirmed against Next's current docs, migrated immediately. The
  `config`/`matcher` export shape is unchanged. **If a future session's
  own training data says "middleware.ts," verify against Next's docs
  before assuming — this rename may be new relative to that training
  data too.**
- **The proxy's cookie check is optimistic by design, not a bug** — it
  only checks whether the httpOnly refresh cookie is _present_, not
  whether the backend still considers it valid (see the file's own
  comment for why). One real, minor, accepted consequence: a stale
  cookie the backend has already invalidated causes a single
  `/login → /dashboard → /login` bounce (the proxy optimistically lets
  it through, `AuthProvider`'s real bootstrap-refresh then fails and
  clears the cookie, `(app)/layout.tsx` bounces back) before settling
  correctly. Not a loop — self-resolves in one round trip — but a
  future session shouldn't mistake the bounce for a bug to chase.
- **`AuthProvider` is mounted at the root layout**, so every page load
  — marketing pages included — fires the bootstrap-refresh request.
  For an anonymous visitor with no cookie, `/api/auth/refresh` returns
  401 immediately without ever calling the real backend (see
  `getRefreshTokenCookie`'s early return in that route handler), so the
  cost is one cheap same-origin round trip, not a real backend call.
  Scoping `AuthProvider` to only the routes that need it would remove
  even that, at the cost of real complexity (multiple provider
  instances, or a route-aware conditional mount) for a marginal gain —
  left as a possible future optimization, not done now.
- The bootstrap-refresh effect deliberately has **no unmount
  cancellation guard**. That pattern exists to avoid calling a state
  setter after unmount, which was a real problem (a console warning)
  through React 17; React 18+ (this project is on 19.2) already makes
  that a harmless no-op. Adding the guard back was tried, fought
  `@typescript-eslint/no-unnecessary-condition`'s async-flow blind spot
  for several iterations, and was reverted — simpler and equally
  correct without it.
- `PASSWORD_MIN_LENGTH` in template literals needed `String(...)`
  around it — this project's `restrict-template-expressions` (from the
  `strictTypeChecked` preset) rejects even a `const`-inferred numeric
  literal type in a template expression without an explicit
  conversion, not just genuinely unsafe types.
- Signup's module multi-select reuses `lib/marketing/modules.ts`'s
  `MODULES` data (icons, names) rather than a separate list — the same
  data now drives the marketing site's Modules pages, the AI showcase,
  and the signup form's module picker.

### M4 — App shell + dashboard home — COMPLETE

Built exactly as scoped: a real Sidebar (desktop-permanent + a mobile
slide-out panel, six links matching `proxy.ts`'s `PROTECTED_PREFIXES`
exactly), a hand-built Cmd+K/Ctrl+K CommandPalette (no dedicated
library in the dependency list — checked before writing it), an
upgraded AppTopbar (Avatar-based user menu with click-outside/Escape
handling, a search/palette trigger, a mobile hamburger, ThemeToggle),
`QueryProvider` (TanStack Query, scoped to `(app)/layout.tsx` only —
see its own comment for why not the root layout), the typed API client
layer (`lib/api/client.ts` + an `auth-bridge.ts` connecting it to
`AuthProvider`'s React state, `entities.ts` + `flows.ts` with the read
paths this milestone needs), `types/entity.ts` + `types/flow.ts` +
`types/enrollment.ts` (hand-written, matching Section 4's exact step
config / Condition AST contract), and a real dashboard home with four
live stat cards — genuinely computed from `GET /entities`/`GET /flows`
calls, not placeholder numbers (see the dashboard page's own comment
for exactly how, given there's no dedicated stats endpoint).

Five new placeholder pages (`entities`, `flows`, `enrollments`,
`verification`, `settings`) exist so the sidebar/palette have
somewhere valid to link — same precedent as every prior milestone's
placeholders, consolidated into one shared `ComingSoon` component
since there are five at once this time. `settings` intentionally
doesn't cite a milestone number — Section 4 mentions the underlying
`PATCH /tenants/me/settings` endpoint but the roadmap never assigns
its UI to a specific milestone, and inventing one would be exactly the
kind of fabricated specificity this project avoids elsewhere.

**The token-refresh bridging problem this section flagged got solved**
via `lib/api/auth-bridge.ts`: `AuthProvider` now exposes its refresh
logic as a single `refreshAccessToken` function (extracted so the
bootstrap effect and the bridge both call the same implementation,
not two copies), registered into a tiny module-level store on every
token change. `client.ts`'s `apiFetch` reads the current token from
that store and can trigger a real refresh — a genuine `useAuth()` call
would've required every API function to be a hook, which doesn't fit
how TanStack Query's `queryFn` wants to be written.

**Real, load-bearing findings from actually building this:**

- **`GET /entities` has no total-count field** (keyset pagination via
  `nextCursor` only, per Section 4) — the People/Accounts stat cards
  request a capped `limit` and show an honest `"100+"` once
  `nextCursor` comes back non-null, rather than a wrong exact number.
  `GET /flows` isn't paginated and accepts a `status` filter, so the
  Published/Draft flow counts ARE exact — the two stat-card types
  aren't symmetric, and a future session extending the dashboard
  should keep that distinction rather than assuming one pattern fits
  both.
- **A second, distinct instance of the `set-state-in-effect` false
  positive** showed up in `auth-provider.tsx`, one abstraction level
  removed from M3's cases:
  `useEffect(() => { void refreshAccessToken(); }, [...])` — a bare
  call to an externally-defined `useCallback` — got flagged, even
  though nothing in the effect body calls `setState` directly.
  Wrapping the same call in an inline async IIFE
  (`void (async () => { await refreshAccessToken(); })();`) resolved
  it cleanly, confirmed empirically rather than reasoned out — the
  rule's static analysis appears to treat "effect body bare-calls a
  locally-defined function reference" differently from "effect body's
  only statement is an
  inline function expression it also calls," even when the two are
  behaviorally identical. Worth trying this exact restructuring first
  if the same rule flags another bare-reference call to a `useCallback`
  later, before reaching for a suppression comment.
- **`command-palette.tsx` needed the same render-time-adjustment fix
  as M2's `SiteHeader`** for resetting search state when the palette
  closes — genuinely the correct pattern here (not a false positive
  this time), split cleanly from the actually-effect-appropriate
  "focus the input on open" DOM action in the same component.
- A `bg-navy/40` modal backdrop would have been a real bug, caught
  before shipping: `--navy` _inverts_ per theme (see its own
  `globals.css` comment from Milestone 2), so a navy-tinted backdrop
  would render as a light overlay in dark mode instead of dimming the
  page. `--inverse` (also from M2, added for exactly the "stay dark in
  both themes" case) is what both `CommandPalette` and `Sidebar`'s
  mobile overlay actually use.
- `NEXT_PUBLIC_API_URL`'s narrowed type doesn't survive into a nested
  closure (`attempt()` inside `apiFetch`) the way it would in the same
  function scope — TypeScript re-widens to the environment variable's
  real `string | undefined` type inside any nested function,
  regardless of an outer `if (!apiUrl) throw`. Re-binding to a new
  `const` with an explicit `: string` annotation fixed it; this is a
  pattern any future file that reads an env var and calls a nested
  helper will hit again.

### M5 — Entities & Flows (read-heavy CRUD, no builder yet) — COMPLETE

Built exactly as scoped: Entities list (`/entities` — type filter,
cursor-based "Load more" via `useInfiniteQuery`, replacing the M4
placeholder), Entity detail (`/entities/[entityId]` — attributes as a
key-value list, a Relationships section covering both `asParent` and
`asChild`, an inline add-relationship form), Entity creation
(`/entities/new` — a dynamic key-value attributes editor via
`useFieldArray`). Flows list (`/flows` — module + status filters),
Flow detail (`/flows/[flowId]` — read-only, `StepSummaryCard` per
step, a version badge, a Publish button that only appears in DRAFT),
and the flow-template gallery (`/flows/new`, `GET /flow-templates` →
`POST /flows/from-template`, landing the user in the new flow's detail
page). `lib/api/entities.ts` and `lib/api/flows.ts` got exactly the
functions their own M4-era header comments said M5 would add — no new
API files.

**A load-bearing finding that changes how the Flows list can honestly
look:** `GET /flows` returns bare `Flow` objects with no `status`
field at all — that lives on `FlowVersion`, which only the single-flow
detail endpoint (`GET /flows/:flowId`) returns embedded as
`currentVersion`. A status badge per row in the LIST view isn't
possible without an N+1 detail fetch per flow, which isn't worth it
for a badge. The list page shows module + name only; `FlowStatusBadge`
is used exclusively on the detail page, where the data actually
exists. Don't add a list-view status badge later without either a
real backend list-with-status endpoint or accepting the N+1 cost
deliberately — this was a genuine design constraint, not an oversight
that got missed.

**Other real decisions worth knowing:**

- **`StepSummaryCard`'s footer label is type-aware, not generic.**
  APPROVAL and VERIFICATION's `nextStepId` means "if approved/verified"
  (Section 4 says so explicitly for APPROVAL; VERIFICATION is inferred
  by the same paired-with-`onRejectStepId` shape, flagged as such in
  the component's own comment). CONDITIONAL_BRANCH's own `nextStepId`
  isn't documented at all — read as "the fallback when no branch
  matches," a reasonable but unconfirmed inference. Every other type
  gets a plain "Then." Verify the two inferred cases against the real
  backend source before trusting them as fact.
- **`lib/flows/format-condition.ts`** renders the Condition AST as
  plain language ("Plan is Enterprise," never JSON) for M5's read-only
  step summaries — M6's interactive branch editor will want the same
  per-operator phrasing this establishes, even though it needs a
  genuinely different (interactive, editable) rendering, not just this
  string formatter reused as-is.
- **No entity-search endpoint exists** (checked Section 4 — the only
  lookup is the paginated list), so the add-relationship form's
  "other entity" picker is a plain `<select>` populated from the first
  100 entities, not real type-ahead search. A reasonable MVP limit,
  flagged in the component's own comment, not a hidden gap.
- **`lib/marketing/modules.ts` was deliberately NOT reused for the
  Flows module filter**, despite already having exactly this data —
  that file's own header comment scopes it to "presentation copy for
  the public site, not a runtime contract." A new, minimal
  `lib/flows/labels.ts` holds just the id→label mapping the
  authenticated app actually needs, with no marketing copy attached.
- A second genuine `exactOptionalPropertyTypes` case: `useInfiniteQuery`'s
  `pageParam` is `string | undefined`, and passing it straight into
  `listEntities`'s optional `cursor` prop fails the same way `Field`'s
  `error` prop and `fetch`'s `body` did in earlier milestones —
  conditionally spread it in rather than pass it directly. This
  pattern (an optional prop rejecting an explicitly-`undefined`-typed
  variable) keeps recurring; recognize it faster next time.
- **A genuine conflict between two type-safety tools**, not a lint
  nitpick: `restrict-template-expressions` wants
  `` `attributes.${String(index)}.key` ``, but react-hook-form's own
  `Path<T>` specifically needs the _numeric_ template pattern
  `` `attributes.${number}.key` `` — `String(index)` satisfies the
  lint rule and then fails typecheck against react-hook-form's own
  generated type. A number always interpolates safely regardless (no
  `[object Object]`-style risk `restrict-template-expressions`
  normally guards against), so this got a targeted, commented
  suppression rather than fighting two tools that both have a
  legitimate but mutually incompatible claim on the same code.

### M6 — Flow builder — COMPLETE

Built: a real drag-reorderable step list (Motion's `Reorder.Group`/
`Reorder.Item` — already a dependency via `motion`, no new library
needed, confirmed by checking the installed package before writing any
code), an add/edit panel per step type with a real typed form matching
each type's exact config shape
(`components/flows/builder/step-config-forms/`, one file per
StepType), entry-step selection, and the
draft/publish lifecycle (`ensureFlowDraft` called unconditionally on
entering the editor, `POST /flows/:id/publish` already existed from
M5). `/flows/[flowId]/edit` is the new route; the M5 detail page grew
an "Edit" link to it.

**The single most important finding this milestone, a real bug caught
and fixed before it shipped, not a hypothetical:** the first working
draft of the reorder feature updated the query cache directly inside
`Reorder.Group`'s `onReorder` callback (fired continuously during a
drag). Two things about that were wrong at once. First, the page's own
render logic re-sorts steps by their `position` field on every render
— since `onReorder` only reordered the array without updating each
step's `position`, that re-sort would have immediately undone the
visual reorder the user just performed (a silent snap-back). Second,
even after fixing that, updating the cache _before_ the persistence
mutation ran would have made the mutation's own diff-against-cache
logic see "no changes" and silently send zero PATCH requests — so
drags would have appeared to work and then reverted on reload, with
no error anywhere to explain why. The fix: local `dragOrder` state
(plus a ref, so `onDragEnd` always reads the final order even if React
hasn't re-rendered yet) kept entirely separate from the query cache
until `reorderMutation` actually succeeds. The cache — and hence the
real backend state — is the only thing `Reorder.Item`'s `onDragEnd`
(not `onReorder`) is allowed to touch. **If a future session touches
this reorder logic, re-read `flow-builder-view.tsx`'s own comments on
`reorderMutation` and `dragOrder` before changing the split between
what `onReorder` and `onDragEnd` are each responsible for** — it looks
like it should be simplifiable and isn't.

**Other real decisions worth knowing:**

- **The 8 step config forms are plain controlled components
  (`(config, onChange)` props), not react-hook-form.** Tried reasoning
  through a react-hook-form-based design first; the combination of a
  discriminated union (8 genuinely different config shapes) and one
  genuinely recursive shape (Condition, inside CONDITIONAL_BRANCH)
  didn't fit RHF's typed API without a lot of generic-type fighting
  for little benefit. `StepEditorCard` holds the actual draft state
  and an explicit Save action instead. M7's AI-drafted flow review UI
  may want to render these same config forms read-only or pre-filled
  — they're plain components taking data in and emitting changes out,
  so that should be straightforward without RHF's own state model in
  the way.
- **Compound conditions (AND/OR/NOT) are a deliberate, flagged scope
  boundary, not a silent gap.** The branch editor's interactive UI
  only handles simple (non-compound) conditions — exactly what M6's
  own spec example shows ("if Plan is Enterprise"). A branch whose
  condition is already compound (e.g. from an AI-generated flow, once
  M7 exists) renders read-only via the existing
  `format-condition.ts` formatter, with a note that it isn't editable
  here yet. This is flagged in the component itself, not just here.
- **`step-summary-card.tsx` (M5) was kept, not superseded** — M6's own
  note above wondered whether it would be. It wasn't: the read-only
  detail view and the editor turned out to want different enough
  layouts (a card that expands into a full form vs. one that just
  summarizes) that forcing one component to do both via an `editable`
  prop would have made both cases worse. `STEP_TYPE_ICON`/
  `STEP_TYPE_LABEL` were still worth consolidating into
  `lib/flows/step-type-display.ts` once a _third_ place
  (`step-editor-card.tsx`) needed the same mapping — the summary card
  and the editor card just don't share the rest of their rendering.
- **No client-side validation of config completeness before Save** —
  e.g. a CONDITIONAL_BRANCH step can be saved with a branch whose
  target step was never selected. The backend is the actual validator
  here (Section 4: publish "validates entry step + every reference
  resolves"); a failed save surfaces the backend's own error message
  via toast. Building real per-field validation for all 8 types was
  judged not worth the added scope for this pass — a reasonable
  MVP boundary, not an oversight, but a future session should know
  it's not there before assuming it is.
- `apiFetch<void>(...)` for `deleteStep` was rejected by
  `@typescript-eslint/no-invalid-void-type` even though the rule's own
  message says void is valid as a generic type argument — this
  project's specific config disagrees. Fixed by letting `deleteStep`'s
  own `Promise<void>` return-type annotation drive inference instead
  of specifying the generic explicitly.
- A real conflict between TypeScript's discriminated-union narrowing
  and chained ternary equality checks (`condition.op === 'in' || condition.op === 'nin' ? ... : ...`)
  showed up again in `simple-condition-editor.tsx` — same category as
  M5's `restrict-template-expressions` conflict, different rule. A
  `switch (condition.op)` narrows reliably where the ternary chain
  didn't; this is now the second time chained ternaries on a
  discriminant have needed restructuring into a switch to typecheck —
  default to switch for any future discriminated-union branching on a
  union of more than two variants.

### M7 — AI Flow Drafting UI — COMPLETE

Built: a composer (module select + a real description textarea) that
kicks off an async `POST /flow-drafts` job; a polling layer (a
`useQuery` with a function-form `refetchInterval` that stops the
instant `status` leaves `PENDING`) backing a genuinely substantive
"generating" state — an elapsed-seconds ticker and kind-specific copy
(`generate` vs `refine`), not a bare spinner; a draft preview that
renders the AI's proposed steps by reusing M6's own `StepSummaryCard`
rather than forking a second step-rendering system; an inline
refinement loop (the same create-draft mutation, called again with
`priorDraft` + `refinementInstruction` + `refinementOfGenerationId`,
replacing the whole draft each turn); an honest, non-alarming
"double-checked this" badge when the backend reports `repaired:
true`; and a materialize action that lands the user straight in the
M6 builder on the new DRAFT flow. `/flows/new` was restructured from a
single toggle into three genuinely equal-weight entry cards (Generate
with AI / Start from a template / Start from scratch) per the UI/UX
doc's explicit call for equal visual weight — `/flows/generate` is the
AI path's own focused route (composer → poll → preview → refine →
materialize is too much to fairly squeeze into a fourth inline panel),
not a secondary link off the template gallery.

**The single most important finding this milestone — a risk the
planning note above had flagged in advance, resolved by design rather
than discovered by watching it break:** an AI draft's steps reference
each other by a client-side `key` string, not a real database `id`,
since nothing is persisted until materialize. `StepSummaryCard`
(M5/M6) was built entirely around resolving references by `id`.
Rather than forking a parallel draft-only step card — which the M6
retrospective above already warns against doing twice — its `step`
prop was widened to the union `Step | AiFlowDraftStep`
(`@/types/flow-draft`), and a small `getNextPointer(step)` helper
(`'nextStepId' in step ? step.nextStepId : (step.nextStepKey ??
null)`) picks the right pointer field at render time. This typechecks
cleanly because every nested `config` shape — the actual
step-type-specific data, approval thresholds, condition branches, and
so on — is reused unchanged from `@/types/flow`; only the outer
envelope (the id/key and next-pointer fields) needed a second shape.
Only one definition needs updating if a ninth step type is ever added,
not two. **If `StepSummaryCard`'s prop type is touched again, re-read
`@/types/flow-draft`'s header comment first** — it explains exactly
which fields are real ids, which are pre-materialization keys, and
which nested fields keep their original `*StepId`-style names despite
holding a `key` string pre-materialization; getting that backwards
silently breaks every branch/reject-path label in a draft preview,
exactly the "Unknown step" failure mode the old planning note warned
about.

**Other real decisions worth knowing:**

- **`?module=...&job=...` in the URL is real application state, not a
  convenience.** `DraftGeneratingState` tells the person it's safe to
  navigate away — that claim is only true if a refresh or a
  back-navigation can actually resume polling the same job, not just
  if the server-side job itself survives. `generate-flow-view.tsx`
  validates the raw `module` query value against `MODULE_VALUES`
  before trusting it (`parseModuleParam`) rather than casting it,
  since it's user-editable URL input, not internal state.
- **A second confirmed occurrence of the `exactOptionalPropertyTypes`
  Motion-prop bug first hit in M1**, this time in
  `draft-generating-state.tsx`: `animate={prefersReducedMotion ?
undefined : {...}}` fails `tsc` (`TS2375`) because `motion.div`'s
  `animate` prop type doesn't itself include `undefined`. Fixed the
  same way `components/ui/spinner.tsx` already does — branch into two
  full elements (a plain `div` vs a `motion.div`), not a
  conditionally-undefined prop. Two occurrences now; treat "branch
  into two elements" as the default fix for any future
  conditionally-animated Motion prop rather than re-deriving it.
- **The Suspense-boundary split for `useSearchParams()` was verified
  by precedent-matching, not by a passing build.**
  `/flows/generate/page.tsx` exactly replicates
  `(auth)/login/page.tsx`'s thin-server-wrapper-plus-`Suspense`
  pattern, but this sandbox's `next build` always fails earlier — the
  root layout's Google Fonts fetch is blocked by the network allowlist
  — before per-route static analysis would ever exercise the
  requirement. **A future session with real network access should run
  `next build` once and confirm `/flows/generate` specifically**
  before treating this as fully proven rather than well-precedented.
- Two self-caught issues before lint ever ran, worth naming so they
  don't recur: an unused `Link` import left over from an earlier draft
  of the `/flows/new` restructure (the AI card ended up using
  `router.push`, for interaction consistency with the other two
  button-based cards), and `h-4.5 w-4.5` on an icon — Tailwind's
  default spacing scale has no `4.5` step (`3.5` → `4` → `5`), fixed to
  the valid `h-4 w-4` already used elsewhere in the codebase.
- **Refinement always regenerates the whole draft; there's no
  partial-apply UI.** This matches the real backend contract
  (`refinementInstruction` + `priorDraft` + `refinementOfGenerationId`
  produces one new, complete `AiFlowDraft`) — a deliberate scope
  boundary, not a gap, so a future session shouldn't go looking for a
  per-step "accept this change" affordance that was never part of the
  contract.

### M8 — Enrollments, the live engine view, and Verification — COMPLETE

Built: an enrollment detail page (`/enrollments/[enrollmentId]`) with a
step-execution timeline — a connecting rail, status-colored dots, and a
per-row output summary — plus a dispatching action panel that renders
the right completion UI for whichever step is next (FORM renders the
same field list M6's editor produces as an actual fillable form; TASK
is a single "mark complete" button; CONTENT only shows an acknowledge
action when `readReceiptRequired`; APPROVAL is an approve/reject-with-
notes form). A verification session detail page
(`/verification/[sessionId]`) with a manual-decision form gated on
`status === 'NEEDS_REVIEW'` and a request-reverification action gated
on `status !== 'APPROVED'`, plus a `/verification` queue page
defaulting to `NEEDS_REVIEW` with the full status range one filter
away. An `/enrollments` flow-picker-plus-list page and a "Start
enrollment" entry point on the Entity Detail page, since the real API
has no flat or per-entity enrollment list — only flow-scoped `GET
/flows/:flowId/enrollments` (confirmed by reading `entities.routes.ts`
directly, not assumed). Cross-module trigger configuration UI on the
flow detail page (`TriggersSection`), mirroring M6's condition-editor
pattern for the trigger's optional `condition`, gated so only ADMIN+
can create/pause/delete a trigger while any VIEWER+ can see the list —
the real API enforces this with `requireRole('ADMIN')`, so the client
mirrors it rather than leaving it to a 403 toast.

**The single most important finding this milestone — an architectural
rule that would have produced an actively wrong UI if the enrollment
timeline had been built before this was confirmed against real backend
source:** a WAITING step with `type: 'VERIFICATION'` is never completed
through the generic `POST /enrollments/:id/steps/:id/complete`
endpoint. It only ever resolves through the verification session's own
flow — a partner webhook or a human calling `POST
/verification-sessions/:id/manual-decision` — both of which call the
same engine function the generic endpoint would otherwise call, so a
second approve/reject form bolted onto the step timeline wouldn't just
be redundant, it would race the session's own resolution path and
could resolve the same step decision twice. `verification-step-
action.tsx` is therefore deliberately read-only: it shows the session's
current status and links into `/verification/[sessionId]`, which is
the only place a decision is actually made. Every other step type's
action component calls the generic complete endpoint directly.

**Other real decisions worth knowing:**

- **`FlowTrigger`'s type definition was wrong before this milestone
  touched it** — missing `sourceEvent`, `targetEntityResolution`,
  `relationshipType`, `condition`, and `isActive`, fields the real
  `triggers.schemas.ts`/`onboarding.schema.ts` actually return. Caught
  by Section 0.4-style verification against real backend source before
  building `TriggersSection`, not discovered by a runtime failure — the
  same verify-before-build discipline this project has followed since
  the M6 recovery.
- **No endpoint resolves an enrollment's `flowVersionId` back to a
  `flowId`, and `ensureFlowDraft` reclones every step with a brand-new
  `id` on each new draft version** — meaning an enrollment's `stepId`s
  will reliably fail to resolve against a flow's _current_ steps once
  that flow has been edited and republished since the enrollment
  started. Rather than detecting or working around the mismatch,
  `flowId` is threaded through navigation only as an optional `?flow=`
  query param (from whichever page already had it), and every per-step
  lookup degrades honestly to a generic "Step &lt;id-suffix&gt;" label
  instead of guessing.
- **No "list every enrollment" or "list this entity's enrollments"
  endpoint exists** — only flow-scoped `GET
/flows/:flowId/enrollments`. `/enrollments` is therefore a
  flow-picker-plus-list, not a flat table, and the Entity Detail page's
  new section is a "Start enrollment" action with honest copy admitting
  there's no list to show, rather than a fabricated one.
- **Two new, simpler `exactOptionalPropertyTypes` fix patterns**,
  distinct from M1/M7's "branch into two JSX elements" Motion-prop fix:
  nullish-coalescing a possibly-`undefined` value to a concrete default
  before an optional prop (`field.required ?? false`), and
  conditionally omitting an optional object key entirely via a ternary
  on the whole object literal rather than passing the key with an
  explicit `undefined` (`notes.trim() ? { decision, notes: notes.trim()
} : { decision }`). Both apply when the optional property isn't
  itself a complex prop like Motion's `animate` — simpler fixes for a
  simpler shape of the same underlying `tsc` strictness.
- **A `Link`/`router.push` to a dynamic route fails `tsc` purely
  because the route doesn't exist as a file yet, or
  `.next/types/routes.d.ts` hasn't regenerated since it was added** —
  not because of any real limitation on combining a dynamic segment
  with a query string. Confirmed by testing both a plain template
  literal and an object-form `{pathname, query}` before and after
  `/enrollments/[enrollmentId]` existed and after a `next build`
  regenerated the types file; the object-form was tried first on the
  (wrong) assumption that the combination itself was unsupported. Fix:
  create the page file, run `next build` once (it still fails later at
  the sandboxed font fetch, but the types file regenerates before that
  point) — the same recovery step already documented for M7's unrelated
  ESLint false-positive.
- **`hasAtLeastRole` (added to `@/types/enums` in an earlier milestone)
  got its first real caller this milestone**, gating `TriggersSection`'s
  add-form and row actions to ADMIN+.
- Reuse over duplication, exercised twice: extracted
  `src/lib/entities/query-keys.ts` once a second consumer (the
  enrollment detail view) needed the exact cache key shape
  `entity-detail-view.tsx` had defined locally and unexported, rather
  than redefining it; and the trigger's optional condition field reuses
  M6's `SimpleConditionEditor`/`formatCondition` directly rather than
  building a second condition editor, with support deliberately scoped
  to simple (non-compound) conditions — the same boundary M6's own
  branch editor drew for `CONDITIONAL_BRANCH`.
- **A stale task-tracker entry, not a stale bug:** the tracker still
  showed the M1-era "`BackendRefreshResponse` nested under `tokens`" fix
  as pending going into this milestone's final verification pass.
  Reading `backend-auth.ts` confirmed the fix was actually applied (and
  documented in its own header comment) back when it was made — only
  the tracker checkbox was never flipped. Worth naming because a future
  session trusting the tracker over the code would have re-investigated
  a bug that doesn't exist.
- **A real `@typescript-eslint/restrict-template-expressions` lint
  error surfaced only on a full-project `eslint .` run, not while
  building the file**: `enrollment-detail-view.tsx` interpolated
  `flowId` (typed `string | null`) into a template-literal `href`
  inside a block gated only on the _separate_ `flowQuery.data` being
  truthy — a correlation real at runtime (the query is `enabled:
flowId !== null`) that TypeScript can't see across two different
  variables. Fixed by narrowing `flowId` itself in the condition
  (`{flowId && flowQuery.data ? ... }`), not by suppressing the rule.
  Worth remembering: a full-project `eslint .` belongs in every
  milestone's closing verification step even when every touched file
  was already linted individually while building it — a cross-variable
  rule like this one only fires with the full picture in view, and
  per-file checks during the build never exercised it.

### M9 — Super Admin Dashboard — COMPLETE

Built: a genuinely separate `/admin` section with its own
`AdminAuthProvider` (no bootstrap-restore, no refresh, no shared token
space with the tenant app — `src/app/admin/layout.tsx` +
`(dashboard)/layout.tsx`'s own client-only guard, since there is no
server-visible signal for `proxy.ts` to check at all) and its own login
page. A single horizontal `AdminTopbar` nav (Tenants, Feature Flags,
and a conditionally-shown Impersonation Activity link), not a Sidebar
split — three pages doesn't earn that complexity yet. Tenant Health
list (`/admin`, cursor-paginated via `useInfiniteQuery`) and detail
(`/admin/tenants/[tenantId]`) pages, the latter carrying a
module-override form gated to REVOPS(+SUPER) and an impersonate form
gated to SUPPORT(+SUPER). A Feature Flags page (`/admin/feature-flags`)
readable by every role with create/edit/delete gated to ENG_ON_CALL
(+SUPER), where "editing" an existing flag locks its identity fields
(key/scope/tenantId) rather than leaving them open to accidentally
upsert a different flag mid-edit. An Impersonation Activity viewer
(`/admin/impersonation-activity`, gated SUPPORT/COMPLIANCE/ENG_ON_CALL)
rendering raw `audit_log` rows generically rather than modeling every
`action` variant.

**The single most important finding this milestone — one that would
have shipped a completely broken impersonation flow if it surfaced only
at manual-test time instead of during design:** an impersonation
session has no refresh token, and therefore no cookie at all for
`proxy.ts` to see — but `proxy.ts`'s existing cookie-presence check
still runs on every request into `PROTECTED_PREFIXES`, including the
impersonating admin's very first navigation into `/dashboard`. Without
some cookie, that check would redirect straight back to `/login`,
before `AuthProvider`'s in-memory state (set client-side via the new
`beginImpersonation`, just before that navigation) ever got a chance to
render anything — and nothing about this shows up as a `tsc` or
`eslint` failure, since it's a pure runtime redirect loop that only a
real click-through would surface. The fix is a second, purely-presence
marker cookie (`IMPERSONATION_COOKIE_NAME` / `ob_impersonation_active`,
`src/lib/auth/impersonation-cookie.ts`) set by a new, deliberately
narrow BFF route (`POST /api/admin/impersonate`) that proxies the real
`POST /v1/admin/impersonate` call with the admin's bearer token
attached by hand, then hands the identical JSON body back to the
client — the access token itself still never touches a cookie, only
this one opaque marker does, matching the refresh cookie's own
"presence only, nothing to decode" treatment. `proxy.ts`'s check
becomes `hasSessionCookie = hasRefreshCookie || hasImpersonationCookie`.
This is also the ONE deliberate crossing of the two otherwise-strictly-
separate auth stacks in this whole codebase: `tenant-health-detail-
view.tsx` (an admin-side component) calls the TENANT
`useAuth().beginImpersonation(...)` directly, reusing `AuthProvider`'s
existing `applySession` under the hood since `ImpersonateResult` and
`SessionBootstrapResponse` are structurally identical shapes.

**Other real decisions worth knowing:**

- **Platform-admin RBAC is an allow-list per route, not a ranked
  hierarchy** — caught during Section 4's re-verification against real
  backend source (`platform-admin.rbac.ts`'s `requirePlatformRole
(...allowed)`), before any admin UI existed to get it wrong in.
  `hasAnyPlatformRole(role, allowed)` (`role === 'SUPER' ||
allowed.includes(role)`) is a new, deliberately separate function from
  the tenant app's `hasAtLeastRole` — SUPPORT/COMPLIANCE/ENG_ON_CALL/
  REVOPS are four non-overlapping specialist slices with no correct
  ordering among them, so reusing the rank-based check would have
  silently granted or denied the wrong roles on every gated action in
  this milestone (module override, flag writes, impersonation, and
  activity viewing all gate on different, non-overlapping subsets).
- **`proxy.ts` can never get an optimistic check for `/admin` itself,
  and that's correct, not a gap** — overturning a prior session's own
  forward-pointing comment that promised "Milestone 9 gets its own
  proxy logic for that." Platform-admin sessions have no refresh token
  and (prior to this milestone's impersonation work) no cookie of any
  kind, so there is nothing server-side to check; `(dashboard)/
layout.tsx`'s client-only guard is the entire access control for
  `/admin/*`. The comment was fixed before it could mislead a future
  session into building dead logic.
- **A dead impersonation session must not silently retry through the
  real tenant refresh flow.** `lib/api/client.ts`'s `apiFetch` calls the
  registered bridge's refresh function unconditionally on any 401. For
  a normal tenant session that's correct; for an impersonation session
  it would either cleanly fail (no refresh cookie — the common case,
  same end state either way) or, if this same browser happens to also
  hold an unrelated real tenant refresh cookie from some other normal
  login, silently succeed and swap the admin into _their own_ tenant
  account mid-impersonation while the banner kept claiming an
  impersonation that was no longer active. `AuthProvider` now registers
  a wrapping `bridgeRefresh` that short-circuits straight to
  `clearSession()` whenever `isImpersonating` is true, instead of ever
  attempting the real refresh call — the same deliberate no-retry-on-401
  shape `AdminAuthProvider` already uses for its own sessions.
- **`isImpersonating` deliberately does not reset when the session
  ends** — only `login`/`signup`/`beginImpersonation` (the three ways a
  session can begin) touch it. `(app)/layout.tsx`'s redirect effect
  reads it at the moment `status` flips to `unauthenticated` to choose
  between `/login` (a real session ending) and `/admin/login` (an
  impersonation session ending, voluntarily or via the 401 short-circuit
  above) — if `clearSession` reset the flag too, that decision would
  always see `false` and send a just-un-impersonated admin to a tenant
  login page they have no tenant credentials for.
- **Ending an impersonation session logs the admin out of `/admin` too,
  and that's accepted, not fixed** — `AdminAuthProvider` is deliberately
  scoped to `src/app/admin/layout.tsx`, not the root layout (an earlier,
  already-documented M9 decision to keep the two identity spaces
  genuinely separate), so navigating out to impersonate and back
  unmounts and remounts it, losing the admin's own session exactly the
  way a hard reload already does by design. Reversing that scoping to
  smooth over this one flow would trade away a deliberate separation for
  a minor convenience; the admin simply signs in again, consistent with
  "short-lived by design" everywhere else in this milestone.
- **`PUT /admin/feature-flags` is a true upsert keyed on `(key, scope,
tenantId)`, not a separate create/edit pair** — "editing" a row in the
  UI pre-fills those three identity fields into the same create form and
  locks them (disabled, not hidden) rather than leaving them editable,
  which would let an admin accidentally mint a brand-new flag mid-edit
  by changing the key instead of updating the one they opened.
- **A query-key design bug, self-caught before it shipped**:
  `tenantHealthListQueryKey` initially took `{module?, cursor?}`, which
  would have given `useInfiniteQuery` a separate cache entry per page
  instead of one growing list — the same mistake the Entities page's own
  `useInfiniteQuery` call already avoids by keying on its filter alone.
  Fixed to `(module?: string)` only, cursor/pageParam left entirely to
  TanStack Query's own internal paging.
- **`@typescript-eslint/no-confusing-void-expression` fires on
  `(values) => mutation.mutate(values)`** passed as a shorthand-arrow
  callback to `handleSubmit`, since `.mutate()` returns `void` — a new
  flavor of the same rule M8 first hit, this time on the INNER callback
  rather than the outer `onSubmit` wrapper. Fixed by adding braces to
  the inner arrow, not by switching to `.mutateAsync()`, which would
  have changed the mutation's error-handling shape for no reason.
- **React Compiler's `incompatible-library` warning on React Hook
  Form's `watch()`** surfaced on `feature-flags-view.tsx`'s
  scope-conditional field — fixed by switching to `useWatch({ control,
name })`, the same compiler-friendly API `signup-form.tsx` already
  established as this codebase's convention, rather than leaving the
  warning in place.

### M10 — Hardening — COMPLETE

Built: a keyboard-operable alternative to the flow builder's
pointer-only drag reorder (explicit move-up/move-down buttons on each
`StepEditorCard` calling the same `reorderMutation` a drag gesture
would, each disabled at the list's own ends) plus a real
`role="list"`/`role="listitem"` pair on its `Reorder.Group`/
`Reorder.Item` (Tailwind's preflight strips `list-style`, which
silently strips the implicit `list`/`listitem` ARIA role too in
Safari/VoiceOver — easy to miss since it's invisible sighted-browser
testing); a from-scratch ARIA combobox/listbox rewrite of the command
palette (`role="combobox"` + `aria-activedescendant`-driven selection
instead of real DOM focus landing on results, a focus trap on `Tab`,
and focus restored to whatever element triggered the palette on
close); one dynamic `opengraph-image.tsx` shared by every
`(marketing)` route (Satori-rendered via `next/og`, on-brand navy
background + `LogoMark` + wordmark, built only after tracing Next's
own metadata-resolution source to confirm text-field OG/Twitter
metadata was already complete via auto-inheritance — the image was the
one real gap, not the text fields); a genuine blank-area bug fix
(`StepExecutionTimeline` rendered a bare, unexplained `<ol>` on an
empty `executions` array) plus five filter-aware empty-state message
fixes across entities/tenant-health/feature-flags/impersonation-
activity/verification; and two scoped `error.tsx` boundaries —
`(app)/error.tsx` and `admin/(dashboard)/error.tsx` — placed to match
exactly where `Sidebar`+`AppTopbar` and `AdminTopbar` are mounted, so a
content-level error no longer takes the whole app shell's navigation
chrome down with it.

**Other real decisions worth knowing:**

- **A root-only `error.tsx` loses the entire app shell, not just the
  broken page — confirmed from Next's own boundary semantics, not
  assumed.** An `error.tsx` wraps its own folder's `{children}` slot
  but never the sibling `layout.tsx` in that same folder. With no
  scoped boundary, an error anywhere under `(app)` bubbled straight
  past `(app)/layout.tsx` — Sidebar and AppTopbar included, since the
  whole layout's rendered output is itself the root layout's
  `{children}` — up to the root boundary, leaving a person with no
  navigation left at all except a hard reload. The fix had to go
  exactly as deep as the chrome it needed to protect:
  `admin/(dashboard)/error.tsx`, not the outer `admin/error.tsx`,
  because `AdminTopbar` is mounted by `(dashboard)/layout.tsx`
  specifically — the outer `admin/layout.tsx` is a bare
  `AdminAuthProvider` wrapper shared with `/admin/login` and owns no
  chrome of its own (confirmed by reading both layout files before
  picking a path, not assumed from the folder name alone).
- **Scope deliberately stayed at `(app)` and `admin/(dashboard)` only,
  not `(auth)` or `(marketing)` too** — matching this section's own
  original roadmap note (above), and re-confirmed as the right call
  rather than just deferred to without checking: `(marketing)` is
  static content with no runtime data-fetching branch logic (already
  read end-to-end during this same milestone's OG/SEO pass), and
  `(auth)/layout.tsx`'s own chrome is a single home-link logo, not a
  multi-item nav whose loss would strand anyone. Spending this task's
  effort there instead would have meant less care on the two surfaces
  with both the highest real risk of an uncaught render error and the
  most navigation chrome to lose.
- **The performance and loading-skeleton audits are both documented
  here as clean passes, not padded with invented fixes to look
  thorough.** Font loading already gets zero-CLS via `next/font`'s
  automatic fallback-metric adjustment (on by default — verified by
  reading how it resolves, not assumed); `lucide-react` already
  qualifies for `experimental.optimizePackageImports` (a genuine
  barrel-file structure, confirmed via its built `dist/esm` output)
  while `sonner` structurally can't (a single-entry `package.json`
  exports map, no subpaths to optimize) — the one real fix here was
  correcting `next.config.ts`'s own comment, which had claimed the
  opposite. All 19 query-using components and all 7 `Spinner` usages
  in the codebase were read individually: every async boundary with a
  predictable eventual content shape already used `Skeleton`, and
  every remaining `Spinner` usage was a root-level auth gate, a
  button's own loading state, or the AI-drafting job poller's
  deliberately-documented custom design (the UI/UX doc explicitly
  disallows a generic spinner there) — not a gap needing a fix.
- **The OG image's background color was checked against ground truth,
  not trusted on the first pass.** A hand-rolled OKLCH→sRGB conversion
  for `navy-950` didn't match this codebase's own pre-existing
  hardcoded `#0d1220` theme-color value, so headless Chromium's own
  canvas pixel readback was used as an independent oracle — which
  confirmed the hand-rolled math was correct, and that the codebase's
  own pre-existing value is itself a minor, pre-existing approximation
  of its claimed OKLCH source. Not fixed, since it's out of this
  task's scope — but not silently papered over either.
- **`next/og`'s `ImageResponse` needs raw font bytes, not a `next/font`
  loader result.** `opengraph-image.tsx` reads the `geist` package's
  `.ttf` files directly off disk
  (`node_modules/geist/dist/fonts/geist-sans/*.ttf`) rather than
  reusing the `GeistSans` export `layout.tsx` already uses elsewhere,
  because Satori's renderer takes actual font data, not a CSS
  variable.
- **Every list-style empty state now distinguishes "nothing exists
  yet" from "nothing matches this filter."** A tenant with zero
  feature flags and a tenant whose filter just happened to match none
  of several real flags used to see the identical, unhelpful "No
  feature flags yet." Each of the five fixed call sites (entities,
  tenant health, feature flags, impersonation activity, verification)
  now branches on whether a filter is actually active before choosing
  its message.

## 6. Environment volatility — operating instructions, not just a warning

This session experienced three sandbox resets while building Milestone 1
alone. All three were fully recoverable with zero net work lost, because
of the practice below — adopted reactively after the first reset, and
by the third, routine. Treat this as a mandatory operating procedure for
any future session on this project, not a one-time incident report.

1. **Checkpoint (zip to `/mnt/user-data/outputs/`) after every single
   file change**, not every 2-4 files and not at milestone boundaries.
   This was originally written as "every 2-4 files" after M1 — the
   Section 0 backend-verification fix pass later proved that too
   loose: a batch of ~9 applied fixes was lost to a reset twice in a
   row before the discipline tightened to one file per checkpoint,
   after which nothing was lost again for the rest of that session.
   The persistent output location has survived every reset this
   project has hit; the live working directory has not survived any
   of them.
2. **After any suspiciously small tool result** (a `find` that returns far fewer files than expected, a syntax check that reports far fewer files checked than exist), stop and do a direct, explicit inventory (`find ... -type f`) before continuing — don't assume a script bug without checking; twice this session it was a real reset, not a bug.
3. **If a reset is confirmed:** check the persistent checkpoint zip FIRST, before attempting any reconstruction from memory. Restore it, re-verify with the full syntax-check harness, compare the restored file list against what should exist, and only recreate the specific gap (if any) — don't blanket-recreate everything from scratch.
4. **This document and the README's Progress-tracking discipline exist BECAUSE conversation history itself is not guaranteed to survive** — a compaction or a fresh session may have zero visibility into prior turns. Keep both current as work happens, not as a post-hoc summary.

## 7. Project structure reference

```
src/
  app/
    (marketing)/        [M2, done; M10 added opengraph-image.tsx; Section 8 revised legal/privacy, legal/cookies, and pricing copy] public site, own layout
    (auth)/              [M3, done] login/signup — real forms; layout from M2 kept as-is
    (app)/                [M4+M5+M6+M8, done; M10 added error.tsx] dashboard, entities (list/detail/new), flows (list/detail/new/edit), enrollments/verification (M8, real UI); settings remains an intentional ComingSoon placeholder — not assigned to any milestone, see its own doc comment (this line previously, incorrectly, still called enrollments/verification ComingSoon after M8 had already replaced them — fixed in M10)
    admin/                [M9, done; M10 added (dashboard)/error.tsx] platform-admin surface, separate auth
    api/auth/             [M3, done] BFF route handlers — login, signup, refresh, logout
    api/contact/           [M2, done; Section 8 wired real Resend delivery, gated on RESEND_API_KEY — see .env.example] contact form submission (validates + logs unconditionally; emails through Resend when configured, still just logs when not)
    layout.tsx, not-found.tsx, error.tsx, loading.tsx   [M1, done; M3 wired AuthProvider in; M10 added scoped error.tsx under (app)/ and admin/(dashboard)/ alongside this root one; Section 8 wired Sentry.captureException into all three, gated on NEXT_PUBLIC_SENTRY_DSN]
    instrumentation.ts, instrumentation-client.ts, sentry.server.config.ts, sentry.edge.config.ts   [Section 8, new] Sentry error-reporting hookup — all four are no-ops with no DSN set, see their own header comments and .env.example
    globals.css                                          [M1, done; M2 added the --inverse token pair]
    sitemap.ts, robots.ts, manifest.ts, icon.svg, apple-icon.tsx  [M1 skeleton, done; M2 populated sitemap.ts's real entries and created the icon.svg the M1 bundle was actually missing]
    proxy.ts (NOT middleware.ts — see M3's own notes)     [M3, done] optimistic protected-route redirects
  components/
    ui/                  [M1, done — Button/Input/Card/Badge/etc.]
    marketing/            [M2, done — header/footer/showcase/module & step-tracker components/contact form/legal doc wrapper]
    auth/                  [M3, done — PasswordRequirements, LoginForm, SignupForm]
    app/                  [M4, done — Sidebar, AppTopbar, CommandPalette, StatCard, ComingSoon]
    entities/              [M5, done — EntityTypeBadge, CreateEntityForm, EntityDetailView]
    flows/                 [M5+M6, done — FlowStatusBadge, StepSummaryCard (read-only, kept — NOT superseded by M6, see M6's own note), FlowDetailView (M5, +Edit link from M6)]
    flows/builder/         [M6, done — FlowBuilderView, StepEditorCard, AddStepMenu, step-config-forms/ (one file per StepType + NextStepSelect + SimpleConditionEditor)]
    providers/             [M4, done — QueryProvider]
  lib/
    utils.ts, motion.ts  [M1, done; M2 added fieldError() to utils.ts]
    marketing/            [M2, done — modules.ts, the hand-written module content data]
    flows/                 [M5+M6, done — format-condition.ts (read-only AST → string), labels.ts, step-type-display.ts (icon/label maps, consolidated once a 3rd consumer needed them), query-keys.ts (flowDetailQueryKey, shared by the M5 read view and M6 builder)]
    api/                  [M4+M5+M6, done through M6's scope — client.ts, auth-bridge.ts, entities.ts, flows.ts (now has the full read+write+draft+steps surface)]
    auth/                 [M3, done — constants.ts, session.ts, password-policy.ts, backend-auth.ts, auth-provider.tsx]
  types/                  [M3+, done through M4 — enums.ts, auth.ts, entity.ts, flow.ts, enrollment.ts] hand-written interfaces, NEVER z.infer
  hooks/                  [as needed]
```

## 8. Post-M10 gap closures — three of README's four "Known gaps" addressed

**This is deliberately not "M11."** All 10 planned milestones finished
at M10 (Section 5) — this section closes specific items from the
"Known gaps (deliberate, not oversights)" list that already existed in
README.md before M10, done because they were explicitly requested
afterward, not because new scope was discovered. Of the four gaps
listed there, three are addressed here (error reporting, contact-form
delivery, pricing/legal copy); the fourth (an E2E test suite) was
offered in the same round and explicitly NOT chosen — still fully
open, nothing started.

**Built:** a complete `@sentry/nextjs` wiring —
`src/instrumentation.ts` + `instrumentation-client.ts` +
`sentry.server.config.ts` + `sentry.edge.config.ts`, `next.config.ts`
wrapped with `withSentryConfig`, and `Sentry.captureException` added
to all three `error.tsx` boundaries alongside (not replacing) their
existing `console.error` calls. Real delivery on the contact form via
Resend (`api/contact/route.ts`), additive to the existing
validate-and-log behavior, never a replacement for it. A legal/pricing
copy pass: Privacy Policy gained a new Section 5 disclosing platform-
administrative access (support impersonation, monitoring) that didn't
exist when M2 originally wrote that page, and its old Section 6 (now
7)'s absolute "data does not cross tenant boundaries" claim was
corrected to carve out that same access; Cookie Policy now documents
the second cookie M9's impersonation flow actually added
(`ob_impersonation_active`) instead of still claiming a single
cookie; the Pricing page gained a small, honest, visitor-facing note
that its figures are illustrative — previously that caveat existed
only in this document and README, never on the live page a real
visitor would see.

**What's genuinely still open, even within these three** — none of
this invents real credentials, numbers, or legal conclusions on the
user's behalf:

- **Every new integration is config-only and inert until real
  credentials are supplied.** No DSN, no API key, no sender domain
  exists anywhere in this repo — `.env.example` documents exactly what
  each one is, where to get it, and confirms (by reading each
  package's own source, not assuming) that leaving them unset is a
  safe no-op rather than a crash. This was a deliberate design
  constraint, not a shortcut: see the "Resend's constructor throws
  synchronously on a missing key" finding below for why that
  constraint had to be actively engineered, not just assumed true by
  analogy with Sentry.
- **Real pricing tiers and the Terms' governing-law jurisdiction are
  still placeholders** — those are business and legal decisions, not
  engineering ones, and nothing here guesses at either. The pricing
  page's new caption makes that honest to visitors; it doesn't resolve
  it.
- **No E2E test suite** — unchanged from before this round; still
  fully open, see README's "Known gaps."

**Other real decisions worth knowing:**

- **Resend's `Resend` constructor throws synchronously
  ("Missing API key...") when no key is found anywhere** — confirmed
  by reading the installed package's own compiled source
  (`node_modules/resend/dist/index.mjs`), not assumed by analogy with
  how Sentry's SDK behaves (which disables itself silently on an unset
  DSN — genuinely different design between the two packages). This is
  why `api/contact/route.ts` checks `process.env.RESEND_API_KEY`
  itself before ever constructing a client, rather than constructing
  one unconditionally and trusting it to degrade gracefully the way
  the Sentry wiring does — copying one package's no-op behavior onto
  the other without checking would have shipped a route that crashes
  on its first real request on any machine without a Resend key set.
- **`instrumentation.ts` and `instrumentation-client.ts` both resolve
  from `src/` specifically, not the project root** — confirmed against
  Next's own build source (`build/utils.js`'s
  `isInstrumentationHookFile` check and `build/create-compiler-
aliases.js`'s alias resolution both check `src/instrumentation(-
client)` before the root-level fallback), not assumed from the
  `src/proxy.ts` precedent alone, though that precedent turned out to
  be the right analogy.
- **`withSentryConfig`'s `SentryBuildOptions` fields are typed as
  plain `string`, not `string | undefined`**, caught immediately by
  `tsc` under this project's `exactOptionalPropertyTypes` the moment
  `org: process.env.SENTRY_ORG` was written directly — fixed with the
  same conditional-spread-to-omit-the-key pattern already established
  in `lib/api/client.ts` and several other files, not a new one
  invented for this.
- **The Privacy Policy's new Section 5 describes real, already-shipped
  M9 behavior, not new policy.** Impersonation sessions are genuinely
  time-limited (the marker cookie's own `maxAge` matches the grant's
  `expiresInSeconds`, verified in `impersonation-cookie.ts`), gated to
  SUPPORT(+SUPER) roles, and logged (the Impersonation Activity
  viewer) — the disclosure is grounded in what the code actually does,
  the same standard M2's original legal copy was held to.
