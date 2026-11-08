import type { VerificationSessionStatus, VerificationProvider } from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 *
 * Verified against the real backend source for Milestone 8
 * (db/schema/verification.schema.ts's `verificationSessions` table,
 * verification.schemas.ts/routes.ts/service.ts). Deliberately never
 * includes raw ID documents or biometric data — only session
 * identifiers, status, and a decision reason; that's a real backend
 * guarantee (the partner's hosted flow handles capture), not just a
 * frontend convention to preserve.
 *
 * Provider credential configuration (`PUT /verification-providers/:id`,
 * ADMIN-only, write-only secrets) is a deliberate scope boundary for
 * this pass — M8's own brief calls for session views, the manual-review
 * queue, and request-reverification, not tenant provider setup, which
 * reads more like a Settings-area concern (still a ComingSoon page as
 * of this milestone).
 */
export interface VerificationSession {
  id: string;
  enrollmentId: string;
  stepExecutionId: string;
  provider: VerificationProvider;
  /** The partner's own session identifier — correlation only, not meaningful to act on here. */
  externalSessionId: string;
  status: VerificationSessionStatus;
  /** Where the applicant completes the partner's hosted capture flow — present while PENDING, null once resolved for most providers. */
  redirectUrl: string | null;
  decisionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
