import type { ListVerificationSessionsParams } from '@/lib/api/verification';

/** Keyed by the full params object (status/stepExecutionId filters included) — the queue view and a step's inline session lookup are genuinely different queries, not the same list re-filtered client-side. */
export const verificationSessionsQueryKey = (params: ListVerificationSessionsParams) =>
  ['verification-sessions', 'list', params] as const;

export const verificationSessionDetailQueryKey = (sessionId: string) =>
  ['verification-sessions', 'detail', sessionId] as const;
