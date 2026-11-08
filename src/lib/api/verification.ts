import { apiFetch } from '@/lib/api/client';
import type { VerificationSession } from '@/types/verification';
import type { VerificationSessionStatus } from '@/types/enums';

/**
 * Milestone 8's `/v1/verification-sessions/*` surface — verified against
 * the real backend source (verification.schemas.ts/routes.ts/service.ts).
 * Provider credential configuration (`/v1/verification-providers/*`,
 * ADMIN-only) is out of scope for this pass — see `@/types/verification`'s
 * header comment.
 */

export interface ListVerificationSessionsParams {
  status?: VerificationSessionStatus;
  /** Filter to one step's history — useful after a request-reverification has created more than one session for it. */
  stepExecutionId?: string;
  limit?: number;
  cursor?: string;
}

export interface ListVerificationSessionsResult {
  sessions: VerificationSession[];
  nextCursor: string | null;
}

/** `GET /verification-sessions` (VIEWER+) — filter `status: 'NEEDS_REVIEW'` for the manual-review queue. */
export async function listVerificationSessions(
  params: ListVerificationSessionsParams = {},
): Promise<ListVerificationSessionsResult> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.stepExecutionId) query.set('stepExecutionId', params.stepExecutionId);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const queryString = query.toString();

  return apiFetch<ListVerificationSessionsResult>(
    `/v1/verification-sessions${queryString ? `?${queryString}` : ''}`,
  );
}

/** `GET /verification-sessions/:sessionId` (VIEWER+). */
export async function getVerificationSession(sessionId: string): Promise<VerificationSession> {
  return apiFetch<VerificationSession>(`/v1/verification-sessions/${sessionId}`);
}

export interface ManualDecisionInput {
  decision: 'approved' | 'rejected';
  notes?: string;
}

/** `POST /verification-sessions/:sessionId/manual-decision` (EDITOR+) — resolves a NEEDS_REVIEW case; 409 otherwise. */
export async function resolveManualDecision(
  sessionId: string,
  input: ManualDecisionInput,
): Promise<VerificationSession> {
  return apiFetch<VerificationSession>(`/v1/verification-sessions/${sessionId}/manual-decision`, {
    method: 'POST',
    body: input,
  });
}

/** `POST /verification-sessions/:sessionId/request-reverification` (EDITOR+) — expires the current session and starts a fresh one via the same provider; 409 if already APPROVED or the enrollment is no longer ACTIVE. */
export async function requestReverification(sessionId: string): Promise<VerificationSession> {
  return apiFetch<VerificationSession>(
    `/v1/verification-sessions/${sessionId}/request-reverification`,
    { method: 'POST' },
  );
}
