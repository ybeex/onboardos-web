/**
 * Shared so the read-only detail view (M5) and the builder (M6) query
 * and update the exact same cache entry — editing a flow and going
 * "back" to view it should show the fresh data without a refetch, and
 * vice versa. Originally defined only in flow-detail-view.tsx;
 * consolidated here once a second consumer needed the same key.
 */
export const flowDetailQueryKey = (flowId: string) => ['flows', 'detail', flowId] as const;

/** Shared by `/flows/generate`'s polling query — one key per job, since a refinement turn starts a brand-new job rather than updating the prior one. */
export const flowDraftJobQueryKey = (jobId: string) => ['flow-drafts', 'job', jobId] as const;

/** Milestone 8 — cross-module triggers are flow-scoped (`GET /flows/:flowId/triggers`), so one key per source flow. */
export const flowTriggersQueryKey = (flowId: string) => ['flows', 'triggers', flowId] as const;
