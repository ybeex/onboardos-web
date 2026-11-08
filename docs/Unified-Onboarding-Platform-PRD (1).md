# PRD: OnboardOS — A Unified, Type-Adaptive Onboarding Platform

**Status:** Draft v1.0
**Date:** June 19, 2026
**Author:** Product Team
**Working name:** OnboardOS (placeholder — pending brand review)

---

## 1. Executive Summary

"Onboarding software" is not one market — it's at least four separate markets that have never been unified:

| Vertical | What gets "onboarded" | Category leaders |
|---|---|---|
| **Employee onboarding** | New hires | BambooHR, Rippling, HiBob, Gusto, Trainual, Camino, Deel, Workday |
| **Product onboarding** | New software users | Appcues, Pendo, Userpilot, Userflow, Chameleon, WalkMe, Whatfix |
| **Identity/KYC onboarding** | New customers (compliance) | Sumsub, Onfido (Entrust), Veriff, Jumio, Trulioo, Persona |
| **Client/implementation onboarding** | New B2B accounts | Rocketlane, GuideCX, Dock, OnRamp, Moxo |

Every one of these tools solves "get someone from zero to value, on a deadline, with checklists, content, and visibility into progress." Every one of them is sold, built, and priced as if the other three didn't exist. A mid-market SaaS company today is realistically paying for tools in **three or four of these categories simultaneously** — Rippling for new hires, Appcues for new users, Sumsub for KYC on signup, and Rocketlane for enterprise account implementation — with no shared data model, no shared analytics, and four separate vendor relationships, support queues, and renewal cycles.

**The opportunity:** build one platform with a shared core (workflow engine, branded portal, automation, analytics, AI content generation, integrations) and a **type selector** at setup time that adapts the experience — UI, terminology, templates, compliance posture — to whichever onboarding job the customer is hiring it for. A company can run employee onboarding and product onboarding and client implementation onboarding side-by-side in one tenant, with one source of truth for "who is being onboarded, through what, and how far along are they."

This PRD scans the four existing markets in detail (Section 2), synthesizes the pain points that are common across all of them (Section 3), and specifies the unified product (Sections 4–14).

---

## 2. Market Landscape Scan

### 2.1 Employee Onboarding

**Job to be done:** Get a new hire from offer-accept to fully productive — paperwork, IT provisioning, culture, role-specific training — while giving HR a single dashboard of where every hire stands.

| Platform | Strongest at | Notable gaps |
|---|---|---|
| **BambooHR** | Clean UX, fast setup, e-signatures, good for SMB (20–300 employees) | Reporting is shallow on lower tiers; many features gated behind paid add-ons; can feel slow/buggy at scale |
| **Rippling** | All-in-one HR + IT + payroll; best-in-class device/access provisioning for remote teams | Cost climbs sharply as more modules are activated; support quality inconsistent; steep initial setup |
| **HiBob** | Modern, social UI (shoutouts, org chart, buddy system); genuinely good 1:1/meeting tooling | Positioned more as full HRIS than dedicated onboarding tool — overkill if that's all you need |
| **Trainual / Waybook** | Turns SOPs into role-based, trackable training with read receipts/quizzes; AI content creation | Not a system of record for HR — pairs with, doesn't replace, an HRIS |
| **Camino / Donut / Doozy** | "Lives in Slack" delivery — meets new hires where they already are instead of a portal nobody revisits | Narrower scope; not a payroll/compliance system |
| **Workday / SAP SuccessFactors** | Enterprise-grade, integrates onboarding with full talent/performance/learning suite | Heavy, slow to implement, requires dedicated admin/consulting overhead |
| **Gusto / Deel** | Gusto: payroll-first SMB simplicity. Deel: built for global/contractor hiring and compliance | Less depth on culture/engagement and role-specific training |

**Pain points (synthesized from G2/Capterra/Trustpilot review patterns):**
- **Portal-and-forget problem.** New hires complete a checklist once and never return; the real onboarding happens informally in Slack/DMs, outside the system of record.
- **Fragmented ownership across HR, IT, and the manager** — no single tool owns the full hire-to-productive journey, so device shipping, access provisioning, and training live in different systems.
- **Reporting/analytics shallow on entry tiers**; advanced insights gated to top pricing tiers.
- **Module-based pricing creep** — tools marketed as "all-in-one" become expensive fast once you activate IT, benefits, performance modules.
- **Generic content** — most platforms manage *paperwork* well but are weak at *role-specific* training that actually shortens time-to-productivity.
- **Setup friction** — "easy to use" once live, but initial implementation/configuration is consistently cited as harder and slower than marketed.

### 2.2 Product/User Onboarding (In-App / PLG)

**Job to be done:** Get a new software user to activation/aha-moment fast, without engineering having to build every tooltip — and prove it's working with analytics.

| Platform | Strongest at | Notable gaps |
|---|---|---|
| **Appcues** | No-code flow builder, fast time-to-first-flow, strong design polish, cross-channel (in-app/email/push) | Analytics depth lighter than Pendo; pricing scales with MAU and has risen significantly (now ~$750/mo entry vs. former ~$250/mo) |
| **Pendo** | Deepest product analytics + guidance in one platform; strong for data-heavy product teams | Guides often need CSS/dev work to look native — creates engineering bottlenecks for non-technical teams; features split across separate modules (Guides/Data Explorer/Listen) adding friction; opaque, quote-only pricing |
| **Userpilot** | Strong segmentation/experimentation, autocapture analytics, generous team seats | No Salesforce/HubSpot integration; no mobile product tours; pricing escalates with MAU and gets unclear at higher tiers |
| **Userflow** | Fast, simple to implement; well-loved by small/early-stage teams | Thinner analytics than Userpilot/Pendo; becomes a fragmented stack once a company needs broader comms/feedback/help-center |
| **Chameleon** | High customization, design flexibility | Needs to be paired with a separate analytics tool (Mixpanel/PostHog/Amplitude) for deep behavioral insight |
| **WalkMe / Whatfix** | Enterprise-grade digital adoption — covers both customer-facing product onboarding *and* internal employee software training | High complexity and cost; overkill for a single SaaS product's onboarding needs |

**Pain points:**
- **Content rot.** Tooltips/walkthroughs reference UI that's already changed by the next release; nobody owns keeping it current.
- **Dev dependency for "no-code" tools.** Marketed as no-code, but native-looking guides routinely require CSS/engineering involvement — defeats the purpose for the PM/growth team that bought the tool to *avoid* engineering tickets.
- **Pricing tied to Monthly Active Users (MAU)** — cost grows independent of value delivered, and is the single most-cited reason teams shop for alternatives.
- **Analytics vs. guidance tradeoff.** Tools are either guidance-first with thin analytics, or analytics-first with guidance that needs dev help — rarely both at native quality.
- **Tool sprawl.** Teams stitch together a tour tool + a separate analytics tool + a separate help-center/resource-center tool + a separate feedback/NPS tool.

### 2.3 Identity / KYC Onboarding

**Job to be done:** Verify a new customer's identity fast enough not to kill signup conversion, while satisfying AML/KYC/regulatory obligations.

| Platform | Strongest at | Notable gaps |
|---|---|---|
| **Sumsub** | Broadest all-in-one suite — KYC, KYB, AML screening, transaction monitoring, customizable workflow builder | Frequent complaints about false document rejections, inconsistent customer support, and unreliable verification claims (e.g., disputed "database check" claims) |
| **Onfido (now Entrust IDV)** | Workflow Studio — sophisticated no-code flow configuration for compliance teams; strong enterprise compliance credentials post-Entrust acquisition | Slower verification speed (30–60s average) than competitors; quote-based pricing skews higher, especially at low volume |
| **Veriff** | Fastest traditional decision speed (~6 seconds average, ~98% automation); hybrid AI + human review for edge cases; transparent per-check pricing | Narrower KYB/tax-specific workflow support vs. Sumsub |
| **Jumio** | Strong fit for regulated, bank-grade KYC built directly into onboarding flows | Less startup-friendly self-serve motion |
| **Trulioo** | Broadest global data-source coverage (500+ sources, 195+ countries) | Less emphasis on biometric/liveness UX polish |

**Pain points:**
- **False rejections / brittle document checks** are the single most common complaint — legitimate users (and legitimate documents) get bounced, causing drop-off and support escalations.
- **Manual review bottlenecks** when automation can't confidently decide — turns a "fast onboarding" promise into a multi-day wait.
- **Opaque or usage-based pricing** that's hard to forecast as verification volume scales.
- **Customer support quality complaints**, especially around disputing wrongful rejections.
- **Geolocation/address-matching friction** when a user isn't physically at their registered address.
- **Speed vs. accuracy tradeoff** is rarely solved — fast providers concede accuracy edge cases; thorough providers concede speed.

### 2.4 Client / Customer Implementation Onboarding (B2B Post-Sale)

**Job to be done:** Get a newly signed B2B account live and to first value through a structured, multi-stakeholder (internal + customer) implementation project — visible to sales, CS, and the client.

| Platform | Strongest at | Notable gaps |
|---|---|---|
| **Rocketlane** | Treats onboarding as customer-facing delivery, not just internal PM — connects planning, resourcing, and billing/margin tracking (PSA-grade); supports multi-threaded, parallel-team execution at scale | Heavier than needed if your onboarding is genuinely lightweight/self-serve |
| **GuideCX** | Clean, white-labeled client portal; strong CRM integrations (Salesforce, HubSpot); intelligent end-date forecasting | Linear, single-threaded onboarding journeys are less suited to complex parallel-team rollouts; pricing is quote-only/opaque; lacks a centralized PM view across many concurrent projects, making bottleneck-spotting harder |
| **Dock** | Strong sales-to-onboarding handoff via a unified client portal | Narrower than full PSA platforms |
| **OnRamp** | Newer, B2B SaaS-focused, strong workflow automation, polished client UX | Smaller ecosystem/integration footprint as a newer entrant |
| **OnboardingHub / Onboard.io** | Lightweight, fast self-serve setup for smaller customer bases (5–500 customers) | No health scoring/lifecycle management beyond onboarding; fewer native integrations; not built for Gantt-level multi-team coordination |

**Pain points:**
- **Linear tools break at scale.** Journey-based, single-track tools work for tens of implementations; once a company runs hundreds concurrently, lack of cross-project visibility becomes the bottleneck.
- **Disconnect between sales handoff and onboarding kickoff** — context from the deal gets lost re-entering data into a separate onboarding tool.
- **No link between onboarding delivery and revenue/margin** in pure "checklist" tools — services-led orgs need utilization/billing tied to the same project.
- **Pricing opacity** (quote-only) makes it hard to evaluate ROI before a sales conversation.
- **Onboarding lives in a tool CS/Implementation uses — but Sales and the customer don't have shared visibility**, recreating the "spreadsheet and email" chaos the tool was bought to kill.

---

## 3. Cross-Vertical Pain Point Synthesis

Despite serving different "who," all four verticals share strikingly similar failure modes. These are the wedges a unified platform should attack:

1. **Tool sprawl, no shared system of record.** A single growing company plausibly runs 3–4 of these categories with zero shared data — "is this person a new hire, a new user, a verified customer, or a live implementation?" has four different answers in four different tools.
2. **"No-code" that secretly needs code.** Across HR, product, and KYC tools alike, "self-serve" platforms repeatedly require engineering/CSS involvement to look native or to configure complex flows — the single most consistent complaint pattern across all four markets.
3. **Pricing that doesn't track value.** MAU-based pricing (product onboarding), module-stacking (HR), usage/quote-based pricing (KYC, client onboarding) — buyers across every vertical cite unpredictable, escalating cost as a top reason for switching.
4. **Content/flow rot.** Whether it's a stale tooltip, an outdated SOP, or a verification rule that hasn't kept up with a new ID format, every vertical suffers when the onboarding artifact doesn't stay in sync with what it's onboarding people *into*.
5. **The "build once, never revisit" portal problem.** New hires, new users, and new clients all default back to ad hoc channels (Slack, email, a call) the moment the structured tool gets in their way — the tool becomes a compliance record, not the actual onboarding experience.
6. **Analytics and action live in different places.** Product onboarding splits guidance from analytics; KYC splits verification from case management; client onboarding splits delivery from financials. Nobody has fully unified "see the friction" and "fix the friction" in one workflow.
7. **Implementation/setup is harder than the demo promised**, across every category — this is the most-repeated theme in the actual review data (BambooHR, Rippling, Pendo, GuideCX all cite this).

---

## 4. Strategic Thesis

> **Onboarding is one underlying problem — structured, time-boxed progression of an entity (person or account) from "new" to "activated," with verification, content, and visibility along the way — wearing four different costumes.**

Build the shared core once. Let the customer pick the costume(s) they need. Let them run more than one at a time, in one tenant, on one shared data model of "entities being onboarded."

This is the same playbook as horizontal platforms that ate vertical point solutions before (e.g., a CRM core powering sales, support, and marketing "clouds"; a single payments core powering checkout, invoicing, and payouts). Onboarding has not yet had its horizontal-platform moment — it's still four separate, VC-funded, single-vertical markets.

---

## 5. Product Vision

**Vision statement:** *One platform, every onboarding job. Pick a type, get a tailored experience — without re-buying the parts that are the same every time.*

**Goals (Year 1):**
- Ship a credible, type-adaptive MVP covering **Employee** and **Product/User** onboarding (the two largest, best-understood markets) with the shared core fully built.
- Add **Client/Implementation onboarding** as the third module (clear PSA-adjacent upsell for B2B SaaS customers already using Product onboarding).
- Partner (not build) for **Identity/KYC** initially — integrate Persona/Veriff/Sumsub as a pluggable verification step inside other flows, rather than competing head-on with compliance-grade KYC vendors in year one (see Section 13, Risks).
- Prove the cross-sell thesis: customers who adopt 2+ modules show materially higher retention and NRR than single-module customers.

---

## 6. Target Users & Personas

| Persona | Onboarding type | Core need |
|---|---|---|
| **HR/People Ops Manager** | Employee | Compliant paperwork + role-specific ramp tracking, visible across every hire |
| **Hiring Manager / Buddy** | Employee | Lightweight task list + culture touch points without living in an HR system |
| **Product Manager / Growth Lead** | Product/User | Ship and iterate in-app flows without filing engineering tickets; tie flows to activation metrics |
| **Customer Success / Implementation Manager** | Client | Branded, multi-stakeholder project visibility from kickoff to go-live, tied to account health |
| **Compliance/Risk Officer** | Identity/KYC | Defensible, auditable verification with low false-rejection rate and fast manual-review turnaround |
| **IT Admin** | Employee + cross-module | Provisioning/deprovisioning access, security/audit trail across every onboarding type |
| **End user being onboarded** (new hire / new signup / new client stakeholder / verifying customer) | All | A single, clear, fast experience — not a maze of disconnected emails and portals |

---

## 7. Core Concept: The Type Selector & Shared Core

At workspace/tenant setup (and again any time a new "onboarding flow" is created), the user picks one or more **Onboarding Types**:

```
[ Employee ]   [ Product/User ]   [ Client/Implementation ]   [ Identity/KYC* ]
```
*KYC available via certified verification partner integrations in v1; native KYC engine is a post-MVP consideration.*

Selecting a type adapts:
- **Terminology** ("new hire" vs. "user" vs. "account" vs. "applicant")
- **Templates** (role-based training checklist vs. activation flow vs. implementation project plan vs. verification flow)
- **Compliance posture** (e.g., I-9/W-4 handling for Employee; PII/biometric handling rules for KYC; SOC 2 logging emphasis for Client)
- **Default integrations** suggested (payroll/HRIS for Employee; product analytics/CDP for Product; CRM for Client; sanctions-list/document databases for KYC)

But underneath, every type runs on the same five core systems:

### 7.1 Shared Core Systems

1. **Visual Workflow Builder** — drag-and-drop steps (form, e-sign, content, task, conditional branch, integration trigger, approval, verification step) usable to build *any* of the four flow types, no engineering required by default.
2. **Branded Portal** — one URL pattern, white-labeled, that adapts its content and chrome to whichever type of "entity" is progressing through it (employee, user, client stakeholder, applicant).
3. **Unified Entity & Progress Data Model** — every onboarding type ultimately produces the same underlying record: an *Entity* (person/account), a *Flow* it's enrolled in, *Steps* completed/pending, and *Events* timestamped against it. This is what makes cross-module analytics and reporting possible.
4. **AI Assistant (content + flow generation, and live support)** — generates first-draft flows from existing source material (SOPs, help docs, contracts), suggests step ordering based on benchmark drop-off data, and can answer in-context questions for the person being onboarded (reducing "ask a human" fallback).
5. **Integrations & Notification Layer** — Slack/Teams/email delivery (attacking the "portal nobody revisits" problem directly), plus a connector marketplace (HRIS, payroll, CRM, product analytics, e-signature, identity verification partners, calendar).

---

## 8. Feature Requirements

### 8.1 Core Platform (all types)

| Feature | Requirement |
|---|---|
| Onboarding-type selector | Multi-select at workspace and per-flow level; can run multiple types concurrently in one tenant |
| Visual workflow builder | No-code; conditional logic; branching by segment/role/risk tier; reusable step library; version history |
| Branded portal | White-label domain, theming, mobile-responsive, accessible (WCAG 2.1 AA) |
| Native-looking guidance | In-app tooltips/modals/checklists render using the host product's existing CSS variables automatically (directly targets the #1 cross-vertical complaint: "no-code" tools needing dev/CSS work) |
| Unified analytics | Funnel/drop-off view, time-to-completion, cohort comparison — same dashboard shape regardless of onboarding type |
| AI flow generation | Point at existing docs/SOPs/contracts → generate first-draft flow + content |
| AI in-context assistant | Embedded Q&A for the person being onboarded, scoped to that flow's content only |
| Notification delivery | Native Slack/Teams/email/SMS delivery — not just an in-portal checklist |
| Integration marketplace | Pre-built connectors (see 8.6); open API + webhooks for the rest |
| Roles, permissions, audit log | Per-module and per-flow permissioning; full audit trail (required for HR, KYC, and Client compliance use cases) |
| Transparent, predictable pricing | Flat per-module pricing with usage bands disclosed up front — explicit reaction to the opacity complaints across every competitor reviewed in Section 2 |

### 8.2 Module: Employee Onboarding

- Preboarding portal (before day 1): paperwork, e-sign, device/equipment requests
- Role-based learning paths with read-receipt/quiz verification (closing the gap competitors like Trainual highlight vs. paperwork-only tools)
- Buddy/manager task assignment with Slack-native delivery (addressing the "portal nobody revisits" pattern)
- IT provisioning checklist + status sync with identity/access tools
- HRIS/payroll integration (sync, not replace)
- Searchable company playbook persisting past week one

### 8.3 Module: Product/User Onboarding

- No-code in-app flow builder (tooltips, modals, checklists, slideouts, NPS/surveys)
- Behavioral + attribute-based segmentation and targeting
- Native autocapture analytics (clicks, page views, form events) without manual event tagging
- A/B testing on flow variants
- In-app resource center for self-serve support
- Flat or banded pricing (not raw MAU multiplier) — direct response to the most-cited competitor complaint

### 8.4 Module: Client/Implementation Onboarding

- Multi-stakeholder branded project portal (internal team + client collaborators)
- Multi-threaded/parallel project support at scale (not just linear single-track journeys)
- Sales-to-onboarding handoff (CRM data carries over automatically — deal terms, contacts, commitments)
- Resourcing/capacity view tied to project timelines (light PSA capability)
- Forecasted go-live dates with bottleneck/risk flagging across *all* concurrent projects (cross-project visibility, the specific gap noted in GuideCX reviews)
- Optional billing/utilization tie-in for services-led orgs

### 8.5 Module: Identity/KYC Onboarding (Partner-first in v1)

- Embeddable verification step inside any flow (Employee background-check-adjacent steps, Client KYB, Product signup KYC)
- Certified integrations with Persona, Veriff, Sumsub, Onfido/Entrust — customer brings their own contract/vendor relationship, OnboardOS orchestrates where the step lives in the broader flow and unifies the resulting status into the same entity record
- Manual review queue/case view inside OnboardOS so a rejected verification doesn't require leaving the platform to resolve (directly targeting the "false rejection + poor support" complaint pattern)
- (Post-MVP candidate) native verification engine — see Section 13 risk discussion before committing engineering investment here

### 8.6 Cross-Module Scenarios (the actual differentiation)

- A **fintech startup** runs Product onboarding (activation flow) → triggers KYC verification step mid-flow → on approval, routes large accounts into Client/Implementation onboarding for white-glove setup → and uses Employee onboarding for its own new hires. One entity data model, one analytics view, one vendor relationship.
- A **B2B SaaS company** ties its Client/Implementation "go-live" milestone to automatically enrolling that account's end users into a Product onboarding flow — no manual handoff.
- Unified reporting answers a question none of today's point tools can: *"Across every onboarding motion in our business — hires, users, verifications, implementations — where are people getting stuck?"*

---

## 9. Non-Functional Requirements

- **Security/Compliance:** SOC 2 Type II from day one (table stakes across all four verticals); GDPR/CCPA data handling; HR module requires region-specific compliance fields (I-9, right-to-work, etc.); KYC integrations must support data residency requirements per partner.
- **Performance:** Portal load < 1.5s; workflow builder autosave; analytics dashboards refresh near-real-time (< 5 min lag).
- **Scalability:** Multi-tenant architecture supporting thousands of concurrent flows per tenant (addressing the "linear tools break at scale" pain point from Client onboarding).
- **Accessibility:** WCAG 2.1 AA across portal and builder.
- **White-labeling:** Full custom domain + theming per tenant, required across all four verticals (every competitor reviewed offers this — it's table stakes, not a differentiator).
- **Localization:** Multi-language content support (critical for Employee and KYC modules especially).

---

## 10. Pricing & Packaging Strategy

Directly designed around the #1 shared complaint (opaque/escalating pricing):

- **Per-module, flat-banded pricing** published openly (no "contact sales" wall for standard tiers) — e.g., bands by number of active flows/entities per month, not raw MAU.
- **Bundle discount** for 2+ modules — this is the core monetizable wedge of the unified thesis; a customer running Product + Client modules should pay meaningfully less than buying Appcues + Rocketlane separately.
- **No required engineering-services tier** to get native-looking guidance (Section 8.1) — explicitly marketed against the "no-code that needs code" complaint.
- Enterprise tier remains custom for large multi-region, multi-module deployments — but self-serve and mid-market tiers must stay transparent.

---

## 11. Competitive Positioning

| Dimension | BambooHR/Rippling | Appcues/Pendo | Sumsub/Onfido | Rocketlane/GuideCX | **OnboardOS** |
|---|---|---|---|---|---|
| Scope | Employee only | Product only | KYC only | Client only | All four, selectable |
| Cross-entity analytics | No | No | No | No | **Yes — shared data model** |
| No-code guidance w/o dev/CSS work | N/A | Partial (common complaint) | N/A | N/A | **Native theming by default** |
| Pricing transparency | Tiered, add-on creep | MAU-based, escalating | Usage/quote-based | Quote-based | **Flat, banded, published** |
| Cross-module bundling discount | No | No | No | No | **Yes** |
| Slack/Teams-native delivery | Partial (niche tools only) | Limited | N/A | Limited | **Core feature** |

**Positioning statement:** *For companies running more than one kind of onboarding (which is most companies past ~50 employees with a paid product), OnboardOS replaces 2–4 point tools with one platform, one data model, and one bill — without sacrificing the depth each individual category leader provides in its lane.*

---

## 12. Success Metrics

- **Activation:** % of new tenants that complete their first flow within 7 days of signup.
- **Cross-sell:** % of customers adopting a 2nd module within 6 months of adopting their 1st.
- **Retention/NRR:** Multi-module customer retention vs. single-module customer retention (the core thesis validation metric).
- **Time-to-value per type:** median days from flow start → completion, benchmarked against category leaders (e.g., beat industry median ramp time for Employee; beat median activation time for Product).
- **Support deflection:** % reduction in "how do I configure this to look native" support tickets vs. category baseline complaint rate.
- **NPS/CSAT** per module, tracked separately (different personas, different bars).

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **"Jack of all trades, master of none"** — category leaders are deep specialists; a generalist risks shallow depth in every lane. | Ship modules sequentially, each built to feature-parity with the *specific* gaps identified in Section 2–3 (not just parity overall) before moving to the next module. Don't claim KYC depth we can't deliver — partner, don't build, until proven demand. |
| **KYC/identity verification carries regulatory and liability weight** far beyond the other three modules (AML law, biometric data regulation). | Treat as partner-integration only in MVP/Year 1. Building a native verification engine is a multi-year, compliance-heavy investment — evaluate only after the other three modules have traction. |
| **Buyers in each vertical are different people with different budgets** (HR vs. Product vs. CS vs. Compliance) — cross-sell motion isn't automatic just because the product supports it. | Go-to-market must target companies/teams already buying 2+ of these categories (e.g., a Series B+ SaaS company with HR, Product, and CS all separately budgeted) and sell the *consolidation* story explicitly, not just "more features." |
| **Migration friction** — companies already have data/workflows in BambooHR, Appcues, etc. | Build first-party migration tooling (import flows/content/historical completion data) for each category leader at launch. |
| **Platform complexity creep** undermines the "fast to set up" promise that wins deals in every vertical today. | The type selector must make each module feel like a focused, single-purpose tool to its specific user — shared infrastructure should be invisible to the end persona, not exposed as added complexity. |

---

## 14. Roadmap (Indicative)

- **Phase 1 (0–6 mo):** Shared core (workflow builder, portal, analytics, AI flow generation) + **Product/User module** (fastest to validate PLG-motion demand) + **Employee module** in parallel (large, well-understood TAM).
- **Phase 2 (6–12 mo):** **Client/Implementation module**; cross-module triggers (e.g., implementation go-live → auto-enroll in product onboarding); migration tooling for top 3 competitors per existing module.
- **Phase 3 (12–18 mo):** KYC partner integrations + manual-review case management; evaluate native verification engine build-vs-partner decision based on actual customer demand signal.
- **Phase 4 (18mo+):** Vertical-specific compliance packages (regulated industries), deeper PSA/financial tie-ins for Client module, expanded AI capabilities (predictive drop-off intervention).

---

## 15. Open Questions

1. Do we validate demand for the unified pitch with existing single-vertical customers before building Module 3/4, or build breadth first to win the consolidation story upfront?
2. What's the right wedge ICP — a company already paying for 2+ categories (consolidation sale) vs. a company with none yet (greenfield, easier to win but smaller initial contract)?
3. How far do we go on native KYC before deciding "partner forever" — what specific signal (e.g., X% of customers requesting it, Y ARR threshold) triggers that build decision?
4. Should Identity/KYC even carry the OnboardOS brand, or live as a clearly-labeled "powered by [partner]" experience to avoid implying compliance guarantees we haven't earned?

---

*End of document. Next step: validate Sections 11–13 (positioning and risk) with 8–10 target-customer interviews before committing engineering roadmap in Section 14.*
