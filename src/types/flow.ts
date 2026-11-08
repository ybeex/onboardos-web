import type {
  Module,
  FlowStatus,
  FlowCreatedVia,
  VerificationProvider,
  TriggerSourceEvent,
  TriggerTargetResolution,
  EntityRelationshipType,
} from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * This file was re-verified field-for-field against the real backend
 * source (src/modules/workflow/workflow.types.ts, condition.ts, and
 * src/modules/flows/flows.schemas.ts) rather than Section 4's
 * reconstruction from memory. Corrections from the original version,
 * each confirmed directly against that source:
 *
 * 1. Every step carries a `key: string`, separate from its server-
 *    assigned `id`. `key` is what condition paths and draft-step
 *    references point at (`steps.<key>.output.field`) — `id` is never
 *    used for that, because AI-drafted steps reference each other by
 *    `key` before anything is persisted and has a real `id` at all.
 * 2. `Flow` has its own real `status: FlowStatus` — this was missing
 *    entirely before, which is why M5's Flows-list page couldn't show
 *    a real per-row status badge.
 * 3. `entryStepId` lives on `FlowVersion`, not `Flow` — it's the
 *    version being edited that has an entry point, not the flow
 *    record itself (a flow can have multiple versions over time, each
 *    with its own draft entry point before publish).
 * 4. `FlowVersion.versionNumber` is actually named `version`.
 * 5. `Condition`'s equality variant includes `neq`, not just `eq`.
 * 6. `EsignStepConfig`/`IntegrationTriggerStepConfig` are genuinely
 *    open objects (`Record<string, unknown>`), not empty
 *    (`Record<string, never>`) — the backend accepts and stores
 *    arbitrary config for these even though it defines no structured
 *    schema for them yet.
 * 7. `FlowTemplate` includes `stepCount: number`, used by the template
 *    gallery (M6) to show "6 steps" without fetching every template's
 *    full detail.
 * 8. `FlowTrigger` (Milestone 8) was a rough placeholder guess before
 *    this field-for-field pass — it was missing `targetEntityResolution`,
 *    `relationshipType`, `condition`, and `isActive` entirely, and used
 *    `flowId` where the real column is `sourceFlowId`. Corrected against
 *    db/schema/onboarding.schema.ts's `flowTriggers` table and
 *    triggers.schemas.ts.
 */

export interface ContentStepConfig {
  body: string;
  readReceiptRequired?: boolean;
  displayMode?: 'PAGE' | 'MODAL' | 'TOOLTIP' | 'SLIDEOUT' | 'BANNER';
}

export interface FormField {
  key: string;
  label: string;
  type: 'TEXT' | 'SELECT' | 'CHECKBOX' | 'DATE';
  required?: boolean;
  options?: string[];
}

export interface FormStepConfig {
  fields: FormField[];
}

export interface TaskStepConfig {
  assigneeRole?: 'MANAGER' | 'BUDDY' | 'IT' | 'HR' | 'OWNER' | 'ADMIN';
  instructions?: string;
}

/** The step's own `nextStepId` (see BaseStep) is the APPROVED path — `onRejectStepId` is the other branch. Confirmed (not inferred) against the backend's decision-routing fields shared by APPROVAL/VERIFICATION. */
export interface ApprovalStepConfig {
  onRejectStepId: string | null;
}

export interface VerificationStepConfig {
  provider: VerificationProvider;
  providerTemplateId?: string;
  onRejectStepId: string | null;
}

export interface ConditionalBranch {
  when: Condition;
  nextStepId: string;
}

export interface ConditionalBranchStepConfig {
  branches: ConditionalBranch[];
}

/** ESIGN and INTEGRATION_TRIGGER have no structured schema on the backend — config is a genuinely open object, accepted and stored as-is. */
export type EsignStepConfig = Record<string, unknown>;
export type IntegrationTriggerStepConfig = Record<string, unknown>;

/**
 * The flow builder's branch editor (M6) renders this as a real
 * condition builder, never a code box. `path` is a dot-path into the
 * enrollment context, typically `entity.attributes.<fieldName>`.
 */
export type Condition =
  | {
      op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
      path: string;
      value: string | number | boolean;
    }
  | { op: 'in' | 'nin'; path: string; values: (string | number)[] }
  | { op: 'exists' | 'notExists'; path: string }
  | { op: 'and' | 'or'; conditions: Condition[] }
  | { op: 'not'; condition: Condition };

interface BaseStep {
  id: string;
  /** Stable reference used by condition paths and AI-draft step references — never the same thing as `id`. */
  key: string;
  title: string;
  position: number;
  nextStepId: string | null;
}

export type Step =
  | (BaseStep & { type: 'CONTENT'; config: ContentStepConfig })
  | (BaseStep & { type: 'FORM'; config: FormStepConfig })
  | (BaseStep & { type: 'TASK'; config: TaskStepConfig })
  | (BaseStep & { type: 'APPROVAL'; config: ApprovalStepConfig })
  | (BaseStep & { type: 'VERIFICATION'; config: VerificationStepConfig })
  | (BaseStep & { type: 'CONDITIONAL_BRANCH'; config: ConditionalBranchStepConfig })
  | (BaseStep & { type: 'ESIGN'; config: EsignStepConfig })
  | (BaseStep & { type: 'INTEGRATION_TRIGGER'; config: IntegrationTriggerStepConfig });

export interface Flow {
  id: string;
  module: Module;
  name: string;
  description: string | null;
  status: FlowStatus;
  createdVia: FlowCreatedVia;
  createdAt: string;
  updatedAt: string;
}

export interface FlowVersion {
  id: string;
  flowId: string;
  status: FlowStatus;
  version: number;
  entryStepId: string | null;
  createdAt: string;
}

/** `GET /flows/:flowId`'s response shape — steps always ordered by `position` ascending. */
export interface FlowDetail {
  flow: Flow;
  currentVersion: FlowVersion;
  steps: Step[];
}

/**
 * A cross-module trigger: when `sourceEvent` fires on an enrollment in
 * `sourceFlowId`, the entity resolved per `targetEntityResolution` is
 * auto-enrolled into `targetFlowId`'s current published version. The
 * literal mechanism behind the PRD's cross-module thesis (e.g.
 * "implementation go-live -> enroll the account's stakeholders into
 * product onboarding"). `condition` reuses the exact same `Condition`
 * type CONDITIONAL_BRANCH steps use, evaluated against the source
 * enrollment's `context`. Only `isActive` is independently updatable
 * (`PATCH`) — any other change is delete + recreate, per the real API.
 */
export interface FlowTrigger {
  id: string;
  sourceFlowId: string;
  sourceEvent: TriggerSourceEvent;
  targetFlowId: string;
  targetEntityResolution: TriggerTargetResolution;
  /** Required (and only meaningful) when `targetEntityResolution` is `RELATED_ENTITY`. */
  relationshipType: EntityRelationshipType | null;
  condition: Condition | null;
  isActive: boolean;
  createdAt: string;
}

/** `GET /flow-templates`'s entries — built-in starter flows (Employee/Product/Client). */
export interface FlowTemplate {
  id: string;
  module: Module;
  name: string;
  description: string | null;
  stepCount: number;
}

/** Step type input for `POST /flows/:flowId/steps` — same discriminated shape as Step, minus the server-assigned `id`. `key` is client-generated (see `@/lib/flows/generate-key`) since condition/draft references need it before the server round-trip completes. */
export type StepInput =
  | {
      type: 'CONTENT';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: ContentStepConfig;
    }
  | {
      type: 'FORM';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: FormStepConfig;
    }
  | {
      type: 'TASK';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: TaskStepConfig;
    }
  | {
      type: 'APPROVAL';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: ApprovalStepConfig;
    }
  | {
      type: 'VERIFICATION';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: VerificationStepConfig;
    }
  | {
      type: 'CONDITIONAL_BRANCH';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: ConditionalBranchStepConfig;
    }
  | {
      type: 'ESIGN';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: EsignStepConfig;
    }
  | {
      type: 'INTEGRATION_TRIGGER';
      key: string;
      title: string;
      position: number;
      nextStepId: string | null;
      config: IntegrationTriggerStepConfig;
    };
