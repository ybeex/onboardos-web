import { apiFetch } from '@/lib/api/client';
import type { Flow, FlowDetail, FlowVersion, FlowTemplate, Step, StepInput } from '@/types/flow';
import type { Module, FlowStatus } from '@/types/enums';

export interface ListFlowsParams {
  module?: Module;
  status?: FlowStatus;
}

/** `GET /flows`'s response shape — not paginated per Section 4, unlike Entities. */
export interface ListFlowsResult {
  flows: Flow[];
}

/**
 * Milestones 4 and 5 built the read/publish/template path; Milestone 6
 * adds the remaining write, draft, and steps operations here per that
 * milestone's own note — same file throughout, never a new one.
 */
export async function listFlows(params: ListFlowsParams = {}): Promise<ListFlowsResult> {
  const query = new URLSearchParams();
  if (params.module) query.set('module', params.module);
  if (params.status) query.set('status', params.status);
  const queryString = query.toString();

  return apiFetch<ListFlowsResult>(`/v1/flows${queryString ? `?${queryString}` : ''}`);
}

export async function getFlow(flowId: string): Promise<FlowDetail> {
  return apiFetch<FlowDetail>(`/v1/flows/${flowId}`);
}

export interface CreateFlowInput {
  module: Module;
  name: string;
  description?: string;
}

/** `POST /flows` — the "start from scratch" path alongside `createFlowFromTemplate`. Returns the new (empty-steps) FlowDetail, same shape as every other flow-detail-returning endpoint here. */
export async function createFlow(input: CreateFlowInput): Promise<FlowDetail> {
  return apiFetch<FlowDetail>('/v1/flows', { method: 'POST', body: input });
}

/**
 * Verified against the real backend (src/modules/flows/flows.routes.ts):
 * this returns ONLY the updated `FlowVersion`, not the full `FlowDetail`
 * — publishing changes the version's status (and nothing about `flow`
 * or `steps` that the caller doesn't already have), so the response is
 * scoped to just what changed. Callers must merge this into their own
 * cached `FlowDetail.currentVersion` rather than replacing the whole
 * cache entry with it.
 */
export async function publishFlow(flowId: string): Promise<FlowVersion> {
  return apiFetch<FlowVersion>(`/v1/flows/${flowId}/publish`, { method: 'POST' });
}

export interface ListFlowTemplatesResult {
  templates: FlowTemplate[];
}

export async function listFlowTemplates(
  params: { module?: Module } = {},
): Promise<ListFlowTemplatesResult> {
  const query = new URLSearchParams();
  if (params.module) query.set('module', params.module);
  const queryString = query.toString();

  return apiFetch<ListFlowTemplatesResult>(
    `/v1/flow-templates${queryString ? `?${queryString}` : ''}`,
  );
}

export async function createFlowFromTemplate(templateId: string): Promise<FlowDetail> {
  return apiFetch<FlowDetail>('/v1/flows/from-template', { method: 'POST', body: { templateId } });
}

export interface UpdateFlowInput {
  name?: string;
  description?: string;
  entryStepId?: string;
}

/** Verified: `PATCH /flows/:flowId` returns the full `FlowDetail`, not just the patched `Flow` record — including `currentVersion`, since `entryStepId` (one of the patchable fields) lives there, not on `flow` itself. */
export async function updateFlow(flowId: string, input: UpdateFlowInput): Promise<FlowDetail> {
  return apiFetch<FlowDetail>(`/v1/flows/${flowId}`, { method: 'PATCH', body: input });
}

/**
 * "Ensures an editable draft exists (clones the published version if
 * needed, with a NEW set of step ids)" — Section 4's own phrasing.
 * Safe to call unconditionally when entering the editor regardless of
 * the flow's current status: trusts the backend's own "if needed"
 * idempotency rather than this app trying to replicate that
 * conditional logic client-side, which risks drifting out of sync
 * with the real rule. Callers MUST re-fetch `getFlow` after this
 * resolves — a clone means the step ids the UI was just showing may no
 * longer be current.
 */
export async function ensureFlowDraft(flowId: string): Promise<FlowDetail> {
  return apiFetch<FlowDetail>(`/v1/flows/${flowId}/draft`, { method: 'POST' });
}

/** 409 if the flow's latest version is published — call `ensureFlowDraft` first (Section 4). */
export async function createStep(flowId: string, input: StepInput): Promise<Step> {
  return apiFetch<Step>(`/v1/flows/${flowId}/steps`, { method: 'POST', body: input });
}

export interface UpdateStepInput {
  title?: string;
  position?: number;
  config?: Step['config'];
  nextStepId?: string | null;
}

export async function updateStep(
  flowId: string,
  stepId: string,
  input: UpdateStepInput,
): Promise<Step> {
  return apiFetch<Step>(`/v1/flows/${flowId}/steps/${stepId}`, { method: 'PATCH', body: input });
}

export async function deleteStep(flowId: string, stepId: string): Promise<void> {
  return apiFetch(`/v1/flows/${flowId}/steps/${stepId}`, { method: 'DELETE' });
}
