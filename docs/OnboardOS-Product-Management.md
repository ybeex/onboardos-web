# OnboardOS — Product Management Doc

**Status:** Draft v1.0 | **Companion to:** Unified Onboarding Platform PRD | **Date:** June 19, 2026

---

## 1. Purpose

This doc operationalizes the PRD into epics, prioritization, sequencing, ownership, and the metrics/release discipline needed to actually ship Phase 1–4 from the PRD roadmap. The PRD says *what* and *why*; this doc says *in what order, owned by whom, measured how*.

---

## 2. Team & RACI (initial build org)

| Function | Responsible for | Phase 1 headcount assumption |
|---|---|---|
| Core Platform PM | Workflow engine, entity data model, portal, analytics shell | 1 |
| Module PM — Employee | Employee-specific templates, HRIS integrations | 1 (can be shared w/ Core PM initially) |
| Module PM — Product/User | Embeddable SDK, in-app guidance, autocapture analytics | 1 |
| Module PM — Client (Phase 2) | PSA-adjacent features, CRM handoff | Hired ahead of Phase 2 start |
| Module PM — Identity/KYC (Phase 3) | Partner integrations, case management | Hired ahead of Phase 3 start |
| Design (UI/UX doc owner) | Design system, builder UX, portal UX | 2 (1 systems-focused, 1 module-flow-focused) |
| Eng Lead — Backend/Platform | Workflow engine, API, super admin | 1 + team |
| Eng Lead — Frontend | Builder app, portal renderer, SDK | 1 + team |
| AI/ML | Flow generation, in-context assistant, drop-off prediction | 1 (can start as a shared resource, not dedicated team, until Phase 2) |

**RACI note:** Core Platform PM is **Accountable** for the shared data model never forking per-module — this is the single most important non-negotiable in the org design, because the entire competitive thesis (Section 11 of PRD) collapses if modules silently diverge into separate schemas under delivery pressure.

---

## 3. Prioritization Framework

**Decision:** Use a modified RICE score, with an added **"Cross-Vertical Leverage" multiplier** — does this feature address a pain point that appears in 2+ of the four vertical scans (Section 2–3 of PRD), or only one?

`Priority Score = (Reach × Impact × Confidence / Effort) × Leverage Multiplier`

| Leverage Multiplier | Criteria |
|---|---|
| 1.5x | Pain point confirmed in 3–4 verticals (e.g., pricing opacity, dev-dependent "no-code," portal-nobody-revisits) |
| 1.2x | Pain point confirmed in 2 verticals |
| 1.0x | Single-vertical-specific feature (still may be high priority, just not a "platform thesis" proof point) |

**Rationale:** Without this multiplier, a backlog naturally fills with module-specific feature requests (because that's where competitive parity pressure is loudest) at the expense of the shared-core investments that are the actual reason a customer would switch to us at all.

---

## 4. Phase 1 Epics (0–6 months) — Shared Core + Employee + Product/User

### Epic 1.1 — Entity & Flow Data Model (Core)
- **Why now:** Every other epic depends on this; it's the foundation the "unified" thesis is built on.
- **Key stories:**
  - As a platform, I can represent any onboardee (hire/user/account/applicant) as an Entity with a type, status, and history, regardless of which module created it.
  - As an admin, I can see all Entities across modules in one filterable list.
  - As the system, I can enroll one Entity in multiple Flows across different modules concurrently.
- **Acceptance criteria (sample):** An Entity created via the Product module's signup flow can later be enrolled in the Client module's implementation flow without re-entering data, and both appear under the same Entity record.
- **Done means:** Schema reviewed and explicitly signed off as supporting all four future module types, not just the two in Phase 1 (prevents the "modules silently diverge" risk from Section 3).

### Epic 1.2 — Workflow Builder (Core)
- Drag-and-drop step builder, shared step-type library, live preview pane, versioning.
- **Acceptance criteria:** A non-technical user can build a 5-step flow with one conditional branch in under 15 minutes without documentation (usability benchmark, tested in user research before GA).

### Epic 1.3 — Branded Portal Shell (Core)
- Theming engine, white-label domain support, progress indicator, mobile-responsive.
- **Dependency:** Must ship alongside 1.2 — a builder with no renderable output is not testable end-to-end.

### Epic 1.4 — Employee Module v1
- Preboarding portal, role-based learning paths w/ read-receipt verification, Slack-native delivery, 2 HRIS integrations (pick highest-overlap with target ICP — likely Rippling and BambooHR as migration targets, per PRD Section 13).
- **Acceptance criteria:** A new-hire flow delivers reminders and content via Slack, not only the portal — directly testing the "portal nobody revisits" countermeasure.

### Epic 1.5 — Product/User Module v1
- Embeddable JS SDK, no-code flow builder integration with Epic 1.2's shared builder, autocapture analytics, native CSS-token inheritance on embed.
- **Acceptance criteria (critical, ties to UI/UX doc Section 1):** A tooltip embedded in a test host app inherits host font/color tokens automatically, with zero manual CSS required — this is the literal, testable version of our #1 positioning claim and must be a hard gate before this epic is called done.

### Epic 1.6 — Core Analytics Dashboard
- Funnel/drop-off, time-to-completion, cohort comparison — built once, parameterized by module.

### Epic 1.7 — Billing & Pricing Infrastructure
- Flat-banded per-module pricing engine, bundle-discount logic for 2+ modules.
- **Why in Phase 1, not later:** The pricing-transparency positioning (PRD Section 10) is a go-to-market claim from day one of sales motion — can't retrofit predictable pricing after launching with placeholder/manual billing.

### Epic 1.8 — Super Admin Dashboard v1 (see BE doc for technical spec)
- Cross-tenant visibility, feature flags, basic support tooling, audit log viewer.
- **Why in Phase 1:** Internal team needs this to operate any tenants at all; it is not deferrable infrastructure.

---

## 5. Phase 2 Epics (6–12 months) — Client/Implementation Module + Cross-Module Triggers

- **Epic 2.1 — Client/Implementation Module v1:** Multi-stakeholder portal, multi-threaded project support, CRM handoff (Salesforce/HubSpot), cross-project bottleneck view (directly answering the GuideCX-at-scale gap from PRD Section 2.4).
- **Epic 2.2 — Cross-Module Triggers:** "Implementation go-live → auto-enroll Entity's end users into Product module flow" as the first shipped proof of the cross-sell thesis (PRD Section 8.6).
- **Epic 2.3 — Migration Tooling:** Import flows/content/historical completion data from BambooHR, Rippling, Appcues, Pendo, GuideCX, Rocketlane (top competitor per existing module, per PRD Section 13 risk mitigation).
- **Epic 2.4 — Light PSA capability:** Resourcing/capacity view tied to project timelines, optional billing/utilization tie-in.

---

## 6. Phase 3 Epics (12–18 months) — Identity/KYC (Partner-First)

- **Epic 3.1 — Verification Step Embedding:** Pluggable step type that calls out to Persona/Veriff/Sumsub/Onfido APIs, normalizes status back into the shared Entity model.
- **Epic 3.2 — Manual Review Case Management:** In-platform queue for resolving rejected verifications without leaving OnboardOS (direct answer to the "false rejection + poor support experience" pain point).
- **Decision gate before this phase starts:** Do not begin Epic 3.1 until Phase 1–2 modules show retention/NRR evidence supporting the cross-sell thesis (PRD Section 12) — KYC carries disproportionate compliance/liability weight and should not be built speculatively.

---

## 7. Release & QA Discipline

- **Release cadence:** Continuous deployment to a staged tenant ring (internal → design partners → general availability), not big-bang module launches.
- **Feature flagging:** Every module-specific feature ships behind a flag scoped at the workspace level, defaulting off, enabling design-partner-only rollout before GA — managed via the Super Admin Dashboard (see BE doc, Section 6).
- **Definition of Done (platform-wide):** Code complete + tests passing + analytics events instrumented (Section 8 below) + accessibility checked against UI/UX doc Section 7 + reviewed against the shared-entity-model non-negotiable (Section 2 above).
- **Cross-module regression policy:** Any change to the shared core (Epics 1.1–1.3) requires regression testing across *every* GA'd module, not just the module that triggered the change — this is the operational cost of the unified architecture and must be budgeted into every core-touching sprint, not treated as a surprise.

---

## 8. Metrics Instrumentation Plan

Maps directly to PRD Section 12 success metrics — instrumentation must exist *before* a metric can be reported, so this is sequenced into Phase 1, not bolted on after launch.

| PRD Metric | Event(s) required | Owner |
|---|---|---|
| Activation (first flow completed in 7 days) | `flow.created`, `flow.published`, `entity.enrolled`, `entity.completed` | Core Platform |
| Cross-sell (2nd module adopted within 6 mo) | `module.activated` per workspace, timestamped | Core Platform |
| Multi-module retention/NRR | Billing system module-count history joined with renewal/expansion events | Billing + Core Platform |
| Time-to-value per type | `entity.enrolled` → `entity.completed` delta, segmented by module | Core Platform |
| Support deflection ("looks native" complaints) | Manual tagging in support tooling initially; revisit for auto-classification in Phase 2 | Support + AI |

---

## 9. Stakeholder Communication Cadence

- **Weekly:** Cross-module PM sync (guards against the "modules silently diverge" risk — this is a standing agenda item, not ad hoc).
- **Bi-weekly:** Design partner feedback review per active module.
- **Monthly:** Roadmap review against PRD Section 14 phases — explicit go/no-go checkpoint before starting the next phase's first epic (especially the Phase 3 KYC decision gate in Section 6 above).
- **Quarterly:** Revisit PRD Section 15 open questions with updated market/customer data — these are not meant to stay open forever.

---

## 10. Risk Register (operational extension of PRD Section 13)

| Risk | Leading indicator to watch | Owner | Response |
|---|---|---|---|
| Modules diverge from shared data model under deadline pressure | Schema PRs that add module-specific tables instead of extending the shared Entity/Flow model | Core Platform PM | Hard review gate — Core PM sign-off required on any new module's data layer before merge |
| Cross-sell thesis doesn't materialize | Cross-sell metric (Section 8) flat after Phase 2 GA + 1 quarter | Leadership | Revisit GTM motion (PRD Open Question #2) before investing in Phase 3 |
| Native CSS-inheritance claim doesn't hold across diverse host-app stacks in the wild | Embed-related support tickets post-Epic-1.5 GA | Product/User Module PM | Maintain a tested host-app matrix (top 10 CSS frameworks/sites) as a regression suite, not a one-time QA pass |
| KYC partner integration creates support/liability gaps we don't own | Any verification-related incident in design-partner phase | Phase 3 PM | Contractual clarity with each partner on liability boundary, reviewed by legal before Epic 3.1 starts |

---

## 11. Go-to-Market Alignment Touchpoints

- Sales needs the **bundle pricing engine (Epic 1.7)** live before any multi-module pitch can be made credibly — PM must treat this as a launch blocker, not a parallel-track nice-to-have.
- Marketing's "replace 2–4 point tools with one platform" positioning (PRD Section 11) is only defensible once **migration tooling (Epic 2.3)** exists — until then, GTM messaging should focus on greenfield customers (PRD Open Question #2), not displacement of incumbents.
- Customer Success needs the **cross-module Entity view (Epic 1.1)** to demonstrate the unified-reporting differentiator in any competitive demo — this should be a standard part of the demo script from GA day one.
