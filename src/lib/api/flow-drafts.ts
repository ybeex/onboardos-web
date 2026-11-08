import { apiFetch } from '@/lib/api/client';
import type { FlowDetail } from '@/types/flow';
import type { AiFlowDraft, FlowDraftJobResult } from '@/types/flow-draft';
import type { Module } from '@/types/enums';

/**
 * Milestone 7's `/v1/flow-drafts/*` surface — verified against the real
 * backend source (see BUILD_PLAN.md Section 4's AI Flow Drafting
 * subsection). Async end-to-end: `createFlowDraft` only queues a real
 * BullMQ job and returns immediately; the caller polls
 * `getFlowDraftJob` until `status` leaves `PENDING`.
 */

export interface CreateFlowDraftInput {
  module: Module;
  /**
   * Required on every call per the real schema, including a refinement
   * turn — not just the first generation. Callers refining an existing
   * draft should pass that draft's own `description` (see
   * `AiFlowDraft.description`) rather than re-prompting the user for
   * it, since it's standing in for "what this flow is for," which the
   * draft itself already captures by this point.
   */
  description: string;
  /** All three of these must be present together for a refinement turn — omit all three for a first generation. */
  priorDraft?: AiFlowDraft;
  refinementInstruction?: string;
  refinementOfGenerationId?: string;
}

export interface CreateFlowDraftResult {
  jobId: string;
  status: 'queued';
  pollUrl: string;
}

/** `POST /flow-drafts` (EDITOR+, rate-limited 20/hour per-tenant). Returns a job to poll, never the draft itself. */
export async function createFlowDraft(input: CreateFlowDraftInput): Promise<CreateFlowDraftResult> {
  return apiFetch<CreateFlowDraftResult>('/v1/flow-drafts', { method: 'POST', body: input });
}

/** `GET /flow-drafts/:jobId` (EDITOR+). Poll this — see `@/lib/flows/query-keys`'s `flowDraftJobQueryKey` for the shared polling query key. */
export async function getFlowDraftJob(jobId: string): Promise<FlowDraftJobResult> {
  return apiFetch<FlowDraftJobResult>(`/v1/flow-drafts/${jobId}`);
}

export interface MaterializeFlowDraftInput {
  module: Module;
  draft: AiFlowDraft;
  generationId: string;
}

/**
 * `POST /flow-drafts/materialize` (EDITOR+). Always lands as a DRAFT
 * flow. Re-validates server-side regardless of what the FE sends. 409
 * if this `generationId` was already materialized once — callers
 * should treat that as "already created, go find it" rather than a
 * generic error, though nothing in this M7 pass needs that distinction
 * yet since the UI disables the action immediately on first click.
 */
export async function materializeFlowDraft(input: MaterializeFlowDraftInput): Promise<FlowDetail> {
  return apiFetch<FlowDetail>('/v1/flow-drafts/materialize', { method: 'POST', body: input });
}
