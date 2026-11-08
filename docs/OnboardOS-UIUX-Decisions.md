# OnboardOS — UI/UX Decisions Doc

**Status:** Draft v1.0 | **Companion to:** Unified Onboarding Platform PRD | **Date:** June 19, 2026

This doc records the *decisions*, not just options — each entry follows **Decision → Alternatives considered → Rationale** so future debates start from "what would change our minds" instead of "let's relitigate this."

---

## 1. Design Principles (derived directly from PRD pain points)

| Principle | What it means in practice | PRD pain point it answers |
|---|---|---|
| **Native by default, not native by CSS hack** | Every in-app guidance element inherits host-app design tokens automatically on embed | "No-code that secretly needs dev/CSS work" — #1 cross-vertical complaint |
| **One canvas, four costumes** | The workflow builder, portal, and analytics views are visually and structurally identical across modules — only labels/templates change | Avoids "jack of all trades" feeling fragmented; keeps each module feeling purpose-built |
| **Show up where work already happens** | Every flow must be deliverable via Slack/Teams/email, not just an in-portal checklist | "Portal nobody revisits" problem (Employee + Client modules especially) |
| **No dead ends in setup** | Every builder screen has a working preview pane; nothing is configured blind | "Implementation harder than the demo" complaint, repeated across every competitor reviewed |
| **Progress is always visible, to everyone who needs it** | Status of any entity (hire/user/account/applicant) viewable from one place regardless of which module created it | Cross-vertical "no shared system of record" pain point |

---

## 2. Information Architecture

### 2.1 Top-level structure

```
Workspace (tenant)
 ├─ Home (cross-module activity feed + "where's everyone stuck" digest)
 ├─ Flows                      ← per onboarding type, but shared builder UI
 │   ├─ Employee
 │   ├─ Product/User
 │   ├─ Client/Implementation
 │   └─ Identity/KYC (partner-embedded steps)
 ├─ Entities                   ← unified directory: every hire/user/account/applicant, filterable by type
 ├─ Analytics                  ← cross-module dashboard + per-module drill-down
 ├─ Integrations
 ├─ AI Assistant (config + usage)
 └─ Settings (branding, roles, billing, audit log)
```

**Decision:** "Entities" is a first-class top-level nav item, not buried inside each module.
**Alternatives considered:** Nest entity lists inside each module (simpler mental model per persona).
**Rationale:** The whole strategic bet is a shared data model. If entities live only inside modules, the product *behaves* like four separate tools wearing one login — undermining the core thesis. A persona who only uses one module will rarely visit the global view anyway, so the cost of exposing it is low.

### 2.2 Type selector placement

**Decision:** Onboarding type is selected per-*flow*, not just once per workspace. Workspace-level type selection during signup only pre-filters which modules are visible in nav (reduces clutter for a single-module customer).
**Alternatives considered:** Lock type at workspace creation only.
**Rationale:** Real customers (per Section 8.6 of the PRD) run multiple types in one tenant from day one or grow into it. Locking at workspace level would force a confusing "create a second workspace" workaround the moment a customer wants module #2 — recreating the exact tool-sprawl problem we're trying to kill.

---

## 3. Core UI Patterns

### 3.1 Workflow Builder

| Aspect | Decision | Rationale |
|---|---|---|
| Canvas model | Linear vertical step list as the default view; optional branch/graph view toggle for complex conditional logic | Reviews consistently praise simple tools (Userflow, Trainual) for being fast to build in, and criticize complex tools (Pendo's split modules) for friction. Default to simple; let power users opt into complexity. |
| Step types | Shared library (Form, Content, Task, E-sign, Approval, Verification, Integration trigger, Conditional branch) — same palette regardless of module | One thing to learn, reused everywhere |
| Live preview | Always-visible preview pane, switchable between "desktop," "mobile," and "Slack message" render | Directly targets "configured blind" complaint pattern |
| Theming inheritance | New flows auto-inherit workspace branding; per-flow override is one click away, not a separate settings page | Reduces setup friction (the #1 repeated complaint across every competitor category) |
| AI-assisted first draft | "Generate from a doc" entry point sits beside "start from scratch" and "start from template," not hidden in a menu | Make the AI differentiator visible at the moment of highest friction (a blank canvas) |

### 3.2 Branded Portal (end-user-facing)

**Decision:** One portal shell, four content modes — the chrome (header, progress indicator, branding) stays constant; only the body content and terminology adapt to onboarding type.
**Alternatives considered:** Fully separate portal templates per module.
**Rationale:** Consistency reduces engineering/design surface area and reinforces brand trust for end users moving between flows (e.g., a new hire who later verifies identity as a customer of the same company should recognize the experience).

**Decision:** Progress indicator is always present and always answers "how much is left and what happens next," even mid-step.
**Rationale:** The most common end-user complaint pattern across KYC and Client onboarding specifically is uncertainty about status/turnaround — this is a direct UX countermeasure, not just a visual nicety.

### 3.3 Analytics Dashboard

**Decision:** Single dashboard shape (funnel + time-to-completion + cohort comparison) reused across all modules; module selector is a dropdown filter, not a different page layout.
**Alternatives considered:** Bespoke dashboard per module (mirrors what Pendo/Rocketlane each do natively for their one vertical).
**Rationale:** This is the single highest-leverage proof point of the "unified" thesis for a buyer evaluating us — if analytics *look* different per module, we've shipped four tools with shared login, not one platform.

### 3.4 AI Assistant Surfaces

| Surface | Behavior |
|---|---|
| Builder | Suggests next step / flags likely drop-off points based on benchmark data, inline in the builder, not a separate chat window |
| End-user portal | Scoped Q&A widget, answers only from that flow's content — never general-purpose, to avoid hallucinated answers about HR policy, compliance, or contract terms |
| Admin/analytics | Plain-language summary of "where people are getting stuck this week," surfaced on Home, not just available on query |

**Rationale for strict end-user scoping:** an AI assistant answering outside its flow's source content is a liability surface across every module (HR policy, KYC status, contract terms) — scope is a safety decision, not just a UX one.

---

## 4. Design System Foundations

- **Decision:** Token-based design system (color, spacing, type, radius) shared across builder UI, internal app, and the *default* (unbranded) portal theme. Customer white-labeling overrides tokens at the portal-theme layer only — internal/builder UI is never white-labeled.
- **Component approach:** Build on accessible primitives (Radix-style unstyled components) rather than a heavier prebuilt UI kit, so the same primitives can be restyled per-tenant for the portal without fighting an opinionated framework.
- **Density:** Builder/admin surfaces default to a denser layout (power users, daily use); portal surfaces default to a more spacious, consumer-grade layout (infrequent end users, first impressions matter more than density).

---

## 5. Theming & White-Label Architecture (UX-facing decisions)

- **Decision:** Branding setup (logo, colors, domain) is a single onboarding-of-the-onboarding-tool step completed before a customer builds their first flow, not discovered later in Settings.
- **Rationale:** Every competitor offers white-labeling, but it's typically a buried settings page found after the first flow is already built and looking generic — costing a redo. Front-loading it removes that rework loop.
- **Decision:** Provide 3 starter themes (Minimal, Bold, Corporate) as defaults so customers without design resources still ship something polished — explicitly aimed at SMB Employee-module buyers who lack a design team (a segment BambooHR/Gusto serve well today).

---

## 6. Empty, Loading, and Error States

- **Empty states** always include a primary action plus a secondary "see an example" link to a populated demo flow — never a blank canvas with no path forward.
- **Loading states** for the workflow builder must distinguish "saving" vs "AI generating" vs "fetching analytics" — generic spinners are explicitly disallowed, because builder users need to know whether it's safe to navigate away.
- **Error states for verification/KYC steps** must always include a plain-language reason and a clear "what happens next" (resubmit, contact support, manual review pending) — directly targeting the "false rejection + confusing support experience" complaint pattern identified in the KYC market scan.

---

## 7. Accessibility & Internationalization (UX commitments)

- WCAG 2.1 AA minimum across builder, portal, and dashboard — not portal-only, since admin users include people with disabilities too.
- All portal copy must be externalized for translation from day one (not retrofitted later) — Employee and KYC modules in particular serve non-English-first end users at high volume.
- Right-to-left layout support is a v1 requirement for the portal shell, deferred for the internal builder UI (acceptable tradeoff given internal/admin users are a known, smaller, more English-skewed audience initially).

---

## 8. Notification & Cross-Channel UX

- **Decision:** Slack/Teams message templates are first-class citizens in the builder (same priority as portal content), not an "also send a notification" afterthought checkbox.
- **Rationale:** This is the direct product answer to the single most-cited Employee-onboarding failure mode ("real onboarding happens in Slack DMs, outside the system of record") — if the system *is* in Slack, that failure mode disappears rather than being merely tracked.

---

## 9. Open UX Questions for Validation

1. Does the linear-vs-graph builder default actually hold once Client/Implementation customers (who need true parallel multi-team tracks) start building real flows — or does Client module need the graph view as its *default*, not an opt-in?
2. How much of the portal shell can realistically stay identical across Employee vs. KYC, given KYC's much higher emphasis on trust/security signaling (badges, encryption messaging) that Employee onboarding doesn't need?
3. Should the AI assistant's end-user-facing surface be opt-in per tenant initially (compliance-sensitive customers may want it off by default)?
