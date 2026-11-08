import type { EnrollmentStatus, StepExecutionStatus } from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * Verified field-for-field against the real backend source for
 * Milestone 8 (db/schema/onboarding.schema.ts's `enrollments`/
 * `stepExecutions` tables, enrollments.schemas.ts/routes.ts/service.ts)
 * rather than guessed from the M4-era planning note. Two things worth
 * knowing before building on this:
 *
 * 1. `Enrollment` carries `flowVersionId`, never a bare `flowId` — there
 *    is no endpoint that resolves a flowVersionId back to its flow, and
 *    no endpoint to fetch a specific (possibly non-current) FlowVersion's
 *    steps by id. The only way this app can show real step titles/
 *    configs next to a StepExecution is when the caller already knows
 *    which flow this enrollment belongs to from its own navigation
 *    context (the flow-scoped enrollments list, or having just created
 *    the enrollment) and passes that `flowId` along — see
 *    `enrollment-detail-view.tsx`'s own comment for the graceful
 *    fallback when it isn't available, or doesn't match (a flow edited
 *    and republished since this enrollment started gets entirely new
 *    step ids — see `ensureFlowDraft`'s own doc comment in
 *    `lib/api/flows.ts` — so an older enrollment's `stepId`s routinely
 *    won't resolve against the flow's *current* steps at all).
 * 2. `StepExecution` has no `type` or `title` of its own — those live on
 *    the Step record, which is exactly the thing (1) says isn't always
 *    reachable. A StepExecution is only ever fully renderable when its
 *    `stepId` resolves against a known steps map.
 */

export interface Enrollment {
  id: string;
  entityId: string;
  flowVersionId: string;
  status: EnrollmentStatus;
  /** The Step currently being executed — null once the enrollment has reached a terminal status with nothing left running. */
  currentStepId: string | null;
  /** Entity attributes snapshot + every completed step's output, merged under `steps.<key>.output`. Read-only here; this is what branch/trigger conditions evaluate against. */
  context: Record<string, unknown>;
  failureReason: string | null;
  /** 0 = started directly. N = the Nth-level cascade of a cross-module trigger chain — see `@/types/flow`'s `FlowTrigger`. */
  triggerDepth: number;
  startedAt: string;
  completedAt: string | null;
}

export interface StepExecution {
  id: string;
  enrollmentId: string;
  stepId: string;
  status: StepExecutionStatus;
  /** BullMQ job id — correlation for debugging, not meaningful to show in UI. */
  jobId: string | null;
  /** Written exactly once, at completion — e.g. `{decision: 'approved', notes: '...'}` for APPROVAL/VERIFICATION, or the submitted field values for FORM. */
  output: Record<string, unknown> | null;
  /** In-flight data available while still WAITING — e.g. a VERIFICATION step's `{verificationExternalSessionId, redirectUrl}`. Distinct from `output`. */
  metadata: Record<string, unknown> | null;
  failureReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

/** `GET /enrollments/:enrollmentId`'s response shape. `stepExecutions` is ordered by `createdAt` ascending, i.e. real execution order. */
export interface EnrollmentDetail {
  enrollment: Enrollment;
  stepExecutions: StepExecution[];
}
