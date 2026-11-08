import { apiFetch } from '@/lib/api/client';
import type { Enrollment, EnrollmentDetail } from '@/types/enrollment';
import type { EnrollmentStatus } from '@/types/enums';

/**
 * Milestone 8's `/v1/enrollments/*` + `/v1/flows/:flowId/enrollments` +
 * `/v1/entities/:entityId/enrollments` surface — verified against the
 * real backend source (enrollments.schemas.ts/routes.ts/service.ts).
 *
 * There is deliberately no "list every enrollment" or "list this
 * entity's enrollments" call here — neither endpoint exists on the real
 * backend. The only list is flow-scoped
 * (`listEnrollmentsForFlow`), matching the backend's own framing:
 * "cross-entity visibility into a single flow," not a tenant-wide feed.
 * See BUILD_PLAN.md's M8 section for what this means for the
 * `/enrollments` page's design.
 */

export interface ListEnrollmentsParams {
  status?: EnrollmentStatus;
  limit?: number;
  cursor?: string;
}

export interface ListEnrollmentsResult {
  enrollments: Enrollment[];
  nextCursor: string | null;
}

/** `GET /flows/:flowId/enrollments` (VIEWER+). */
export async function listEnrollmentsForFlow(
  flowId: string,
  params: ListEnrollmentsParams = {},
): Promise<ListEnrollmentsResult> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const queryString = query.toString();

  return apiFetch<ListEnrollmentsResult>(
    `/v1/flows/${flowId}/enrollments${queryString ? `?${queryString}` : ''}`,
  );
}

export interface CreateEnrollmentInput {
  /** Enrolls into this flow's current PUBLISHED version — resolved server-side, never a specific version id. */
  flowId: string;
}

/** `POST /entities/:entityId/enrollments` (EDITOR+). */
export async function createEnrollment(
  entityId: string,
  input: CreateEnrollmentInput,
): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/v1/entities/${entityId}/enrollments`, {
    method: 'POST',
    body: input,
  });
}

/** `GET /enrollments/:enrollmentId` (VIEWER+) — the enrollment plus its full step-execution history, oldest first. */
export async function getEnrollmentDetail(enrollmentId: string): Promise<EnrollmentDetail> {
  return apiFetch<EnrollmentDetail>(`/v1/enrollments/${enrollmentId}`);
}

export interface CompleteStepInput {
  /**
   * APPROVAL steps: must include `decision: 'approved' | 'rejected'`
   * (an optional `notes` string is used as the failure reason on a
   * rejection with no further path). VERIFICATION steps resolve through
   * the verification session's own manual-decision/webhook path instead
   * — see `@/lib/api/verification` — never through this endpoint
   * directly from the UI, even though the backend's generic engine
   * function would technically accept it. Every other waiting type:
   * arbitrary captured data (form values, task notes, an empty object
   * for a plain acknowledgment).
   */
  output: Record<string, unknown>;
}

/** `POST /enrollments/:enrollmentId/steps/:stepExecutionId/complete` (EDITOR+). Returns the refreshed `EnrollmentDetail`, not just the one step. */
export async function completeStep(
  enrollmentId: string,
  stepExecutionId: string,
  input: CompleteStepInput,
): Promise<EnrollmentDetail> {
  return apiFetch<EnrollmentDetail>(
    `/v1/enrollments/${enrollmentId}/steps/${stepExecutionId}/complete`,
    { method: 'POST', body: input },
  );
}
