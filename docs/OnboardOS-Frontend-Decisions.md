# OnboardOS — Frontend Decisions Doc

**Status:** Draft v1.0 | **Companion to:** PRD + UI/UX Doc + Backend Design Doc | **Date:** June 19, 2026

Each decision follows **Decision → Alternatives considered → Rationale**, consistent with the other companion docs.

---

## 1. Overall Frontend Topology

OnboardOS frontend is **four distinct applications**, not one SPA — because they have genuinely different audiences, performance requirements, and deployment risk profiles:

| App | Audience | Key constraint |
|---|---|---|
| **Builder/Admin App** | Internal users at customer orgs (HR admin, PM, CS manager, compliance officer) | Feature-dense, daily use, can tolerate a larger JS bundle |
| **Portal App** | End users being onboarded (new hire, new signup, client stakeholder, applicant) | Must be fast, lightweight, first-impression-critical, often a cold/unauthenticated visit |
| **Embeddable SDK** | Lives *inside the customer's own product* (Product/User module's in-app guidance) | Must be tiny, zero CSS conflicts with host app, framework-agnostic |
| **Super Admin App** | Internal OnboardOS staff (Support, Compliance, Eng on-call, RevOps) | Security-sensitive, lower performance pressure, smaller user count |

**Decision:** Separate deployables/bundles for all four, sharing a common design-token package and TypeScript type definitions (generated from the backend's API schema), not a single monorepo app with route-based splitting alone.

**Alternatives considered:** One Next.js app serving all four via different route groups.

**Rationale:** The Portal App's performance bar (cold, unauthenticated, first-impression load — directly tied to the PRD's <1.5s load NFR) would be compromised by being bundled in the same build pipeline as the much heavier Builder App. The Embeddable SDK has an entirely different bundling requirement (must not assume Next.js/React even exists in the host page) and must ship independently. Splitting them avoids one team's release cycle blocking another's, mirroring the backend's service-boundary rationale.

---

## 2. Monorepo & Tooling

- **Decision:** Turborepo monorepo containing all four apps + shared packages (`@onboardos/design-tokens`, `@onboardos/api-types`, `@onboardos/ui-primitives`).
- **Rationale:** Keeps the "one canvas, four costumes" principle from the UI/UX doc enforceable at the code level — a shared `ui-primitives` package makes it structurally harder for the Builder App and Portal App to drift into inconsistent component behavior, the frontend equivalent of the backend's shared-Entity-model discipline.
- **Build/deploy:** Each app deploys independently (own CI pipeline, own preview-deploy-per-PR), but shared packages are versioned and bumped explicitly — no implicit cross-app breakage from an unreviewed shared-package change.

---

## 3. Builder/Admin App

| Aspect | Decision | Rationale |
|---|---|---|
| Framework | React + TypeScript, Vite | Dense, interactive, client-heavy app (drag-and-drop builder, live preview) — no need for SSR; Vite gives fast dev iteration for a team shipping frequently across 4 modules |
| State management | TanStack Query (server state) + Zustand (local/UI state) | Avoids a heavy global store (Redux) for what's mostly server-derived state; Zustand handles builder-canvas-local state (drag positions, unsaved draft) cleanly without boilerplate |
| Workflow builder canvas | React Flow (or equivalent node-graph library) for the graph view; a simpler custom vertical-list component for the default linear view (per UI/UX doc 3.1) | Building a node-graph editor from scratch is a multi-month investment with little differentiation value; the *linear* default view is where our actual UX differentiation lives, so that's custom-built and polished, while the graph view leans on a mature library |
| Charts (Analytics Dashboard) | Recharts for standard funnel/cohort charts; visx for any bespoke visualization needs | Recharts covers 90% of the "single dashboard shape" requirement (PM doc Section 4/Epic 1.6) with low custom-code burden |
| Forms | React Hook Form + Zod, schemas generated from backend's API types where possible | Step-type forms (Section 3.1 of UI/UX doc — Form, Content, Task, etc.) are numerous and structurally similar; codegen from shared API types reduces FE/BE drift, directly supporting the cross-doc "shared model" discipline |
| Internal data fetching to BFF | GraphQL client (urql, lightweight) against the backend's GraphQL BFF (per BE doc Section 5) | Matches backend's BFF decision; avoids waterfalled REST calls for composite views (Entity + Enrollment + Analytics summary on one screen) |

---

## 4. Portal App (end-user-facing)

| Aspect | Decision | Rationale |
|---|---|---|
| Framework | Next.js (App Router), server-rendered | Cold, often-unauthenticated, first-impression-critical traffic (PRD's <1.5s NFR) — SSR avoids a blank-then-hydrate flash and gets meaningful content painted fast; also enables future SEO needs for any public-facing portal content (e.g., a client implementation status page shared externally) |
| Theming engine | Server-resolved theme (tenant branding fetched and injected as CSS variables at render time, not client-side fetch-then-repaint) | Directly prevents a "flash of unbranded content" — theming is core to white-label trust (UI/UX doc Section 5), so it cannot be an afterthought client-side fetch |
| Rendering strategy per module | Employee/Client/KYC portals: SSR per request (authenticated, personalized, low-traffic-per-tenant). Product module's *resource center* (self-serve help content, not the embedded SDK): ISR (incremental static regeneration), since this content is more cacheable and higher-traffic | Matches caching strategy to actual traffic/personalization shape per module rather than one blanket policy |
| Internationalization | next-intl, locale resolved server-side from tenant/user settings | Matches UI/UX doc's Section 7 commitment that portal copy is externalized from day one |
| Accessibility | Automated axe-core checks in CI on every portal PR, blocking merge on new violations | Operationalizes the WCAG 2.1 AA commitment as a CI gate, not a manual pre-launch checklist easily skipped under deadline pressure |

---

## 5. Embeddable SDK (Product/User Module's in-app guidance)

This is the single highest-risk frontend deliverable — it's the literal mechanism behind our most-tested positioning claim ("native by default, not native by CSS hack," UI/UX doc Section 1).

| Aspect | Decision | Rationale |
|---|---|---|
| Framework | Preact (not React) compiled to a single small bundle (<15KB gzipped target) | The SDK runs inside a customer's arbitrary host page — bundle weight directly affects *their* product's performance, and we don't control their stack. Preact's tiny footprint minimizes that cost while keeping a component model the team already knows from the rest of the React ecosystem. |
| CSS isolation & inheritance | Shadow DOM for structural isolation (prevents host CSS from breaking our components), combined with explicit CSS custom-property *reading* from the host page's computed styles to auto-populate our design tokens (font-family, primary color, border-radius) | This is the literal technical implementation of the "native by default" claim. Shadow DOM alone would isolate us *too well* — looking generic, not native. Reading host computed styles into our token layer is what makes the embedded tooltip look like it belongs, without requiring the customer to write any CSS — directly answering the #1 cross-vertical complaint pattern identified in the PRD market scan. |
| Distribution | `<script>` tag (CDN-hosted, versioned) + npm package for SPA frameworks (React/Vue wrapper, thin, around the core Preact bundle) | Matches how every reviewed competitor (Appcues, Pendo, Userpilot) ships — customers expect this exact integration pattern, so deviating would add adoption friction for no positioning benefit |
| Versioning/rollout | Semantic versioning with a pinned-version default (customers explicitly opt into upgrades) rather than always-latest auto-update | A silent SDK update changing rendering behavior inside a customer's live product is an unacceptable risk profile; this trades a little operational overhead (supporting multiple SDK versions concurrently) for customer trust |
| Testing matrix | Automated visual-regression suite against a maintained matrix of the top ~10 CSS frameworks/site structures (Tailwind, Bootstrap, plain CSS, common CMS themes) | Directly operationalizes the PM doc's "host-app matrix regression suite" risk mitigation (Section 10 of PM doc) — this must be a continuously running suite, not a one-time QA pass before GA |

---

## 6. Super Admin App

| Aspect | Decision | Rationale |
|---|---|---|
| Framework | React + TypeScript, Vite (same toolchain as Builder App) | Lower priority for a separate framework choice — reusing Builder App's toolchain and shared `ui-primitives` package minimizes build burden for a smaller, internal-only audience |
| Access control rendering | Role-scoped routing/components matching the backend's role-scoped permissions (BE doc Section 6.2) — UI must not even render controls a role can't use, not just disable them | Defense-in-depth at the UI layer, consistent with least-privilege requirements feeding SOC 2 readiness |
| Impersonation UX | Persistent, unmissable visual banner during "view as tenant" mode (cannot be dismissed without exiting impersonation) | Prevents an internal operator from forgetting they're in impersonation mode and taking an action that's logged against the wrong context — directly supports the audit-logging integrity requirement from the BE doc |

---

## 7. Shared Design System Implementation

- **Decision:** Tailwind CSS (utility-first) for the Builder, Portal-default-theme, and Super Admin apps, with the token layer (`@onboardos/design-tokens`) generating Tailwind config from the same source tokens used by the Embeddable SDK's CSS-variable approach.
- **Rationale:** One token source of truth feeds both Tailwind (for our own apps) and the SDK's runtime CSS-variable injection — avoids the design system literally forking into "internal app colors" vs. "embedded widget colors" as two unrelated systems, which would undermine design consistency across the whole platform exactly as schema drift would undermine the backend.
- **Component primitives:** Radix UI primitives (unstyled, accessible) wrapped with Tailwind styling in `@onboardos/ui-primitives` — matches the UI/UX doc's accessibility-first component approach (Section 4) and gives accessible behavior (focus management, ARIA) for free rather than reimplementing it per app.
- **Documentation:** Storybook, covering `ui-primitives` components used across Builder/Portal/Super Admin (not the SDK, which has its own minimal internal component set given its size constraints).

---

## 8. Testing Strategy

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Vitest | Component logic, utility functions, token transforms |
| Integration | React Testing Library | Builder form flows, step-type configuration panels |
| End-to-end | Playwright | Critical paths per module: build-a-flow → publish → entity-completes-flow, run against all four apps' staging deploys |
| Visual regression | Chromatic (Storybook-integrated) for `ui-primitives`; custom Playwright-screenshot matrix for the SDK (Section 5) | Prevents the design-token source-of-truth claim (Section 7) from silently drifting between apps |
| Accessibility | axe-core in CI (Portal App per Section 4) + manual audit pass per major release across all apps | Operationalizes WCAG 2.1 AA as a continuous check |

---

## 9. Performance Budgets

| App | Budget | Measurement |
|---|---|---|
| Portal App | First Contentful Paint < 1.5s (matches PRD NFR), Time to Interactive < 2.5s on 3G-equivalent throttling | Lighthouse CI on every PR, blocking on regression past budget |
| Embeddable SDK | < 15KB gzipped core bundle; < 50ms to first paint of any guidance element after trigger | Bundle-size CI check + synthetic embed-page benchmark |
| Builder App | Time-to-interactive < 3s on initial load (less critical than Portal given authenticated, repeat-use audience), but builder-canvas interactions (drag, save) must feel instantaneous (< 100ms perceived latency) | Web Vitals monitoring in production, alert on regression |

---

## 10. Open Frontend Questions

1. Does the Embeddable SDK's host-style-reading approach need a manual override/preview step in the Builder App (so a customer can confirm what was auto-detected before publishing), or is fully automatic inheritance acceptable risk for v1?
2. Should the Portal App's Client/Implementation multi-stakeholder view be a fully separate route structure from the single-user Employee/Product portal flows, given how different "many people collaborating on one Enrollment" is from "one person progressing through one Enrollment" interaction-wise?
3. At what point does the Super Admin App's audience/feature set justify its own design-token theme (visually distinguishing "this is an internal tool" from customer-facing apps) versus simply reusing the default unbranded theme as-is?
