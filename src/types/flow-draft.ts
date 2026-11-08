import type {
  ContentStepConfig,
  FormStepConfig,
  TaskStepConfig,
  ApprovalStepConfig,
  VerificationStepConfig,
  ConditionalBranchStepConfig,
  EsignStepConfig,
  IntegrationTriggerStepConfig,
} from '@/types/flow';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * Milestone 7's AI Flow Drafting contract, verified against the real
 * backend source (src/modules/flow-drafting/flow-drafting.{routes,
 * schemas,types}.ts — see BUILD_PLAN.md Section 4's AI Flow Drafting
 * subsection). The one thing to hold in your head reading this file:
 * a draft is NOT a flow yet. Nothing is persisted until
 * `materializeFlowDraft` is called, so draft steps can't reference each
 * other by a real database `id` — there isn't one yet. They reference
 * each other by `key` instead, exactly like a manually-authored
 * `StepInput` does before it's saved.
 *
 * The base pointer (`nextStepKey`) IS renamed to say "Key" and make
 * that obvious. The config-nested pointers are NOT: `ApprovalStepConfig
 * .onRejectStepId`, `VerificationStepConfig.onRejectStepId`, and
 * `ConditionalBranch.nextStepId` keep their original field names
 * verbatim, because the backend's `AiFlowDraft` schema reuses the exact
 * same config schemas manual step authoring uses — it does NOT rename
 * the nested fields for the draft context. At this pre-materialization
 * stage, those `*StepId`-named fields hold `key` strings, not real ids,
 * despite the name. This is the single easiest mistake to make when
 * building draft-preview or refinement UI: reading `onRejectStepId` and
 * assuming it's a real id, or writing a lookup keyed by `id` instead of
 * `key`. Reusing `@/types/flow`'s config types here (rather than a
 * separate, forked set) keeps the two in sync automatically and makes
 * this shared-shape-different-semantics relationship explicit instead
 * of accidental.
 */

interface BaseDraftStep {
  key: string;
  title: string;
  position: number;
  nextStepKey?: string | null;
}

export type AiFlowDraftStep =
  | (BaseDraftStep & { type: 'CONTENT'; config: ContentStepConfig })
  | (BaseDraftStep & { type: 'FORM'; config: FormStepConfig })
  | (BaseDraftStep & { type: 'TASK'; config: TaskStepConfig })
  // config.onRejectStepId holds a KEY string here, not a real id — see this file's header comment.
  | (BaseDraftStep & { type: 'APPROVAL'; config: ApprovalStepConfig })
  // config.onRejectStepId holds a KEY string here, not a real id — see this file's header comment.
  | (BaseDraftStep & { type: 'VERIFICATION'; config: VerificationStepConfig })
  // config.branches[].nextStepId holds a KEY string here, not a real id — see this file's header comment.
  | (BaseDraftStep & { type: 'CONDITIONAL_BRANCH'; config: ConditionalBranchStepConfig })
  | (BaseDraftStep & { type: 'ESIGN'; config: EsignStepConfig })
  | (BaseDraftStep & { type: 'INTEGRATION_TRIGGER'; config: IntegrationTriggerStepConfig });

/** Structurally identical to how the backend's own built-in templates work internally. */
export interface AiFlowDraft {
  name: string;
  description?: string;
  entryStepKey: string;
  steps: AiFlowDraftStep[];
}

export type FlowDraftJobStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/** `GET /flow-drafts/:jobId`'s response shape — poll this until `status` leaves `PENDING`. */
export interface FlowDraftJobResult {
  status: FlowDraftJobStatus;
  generationId?: string;
  draft?: AiFlowDraft;
  /** The model's first response failed validation and one automatic backend-side repair round-trip fixed it. Surface honestly, never hide it. */
  repaired?: boolean;
  errorMessage?: string;
}
