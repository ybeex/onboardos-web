import { apiFetch } from '@/lib/api/client';
import type { FlowTrigger, Condition } from '@/types/flow';
import type {
  TriggerSourceEvent,
  TriggerTargetResolution,
  EntityRelationshipType,
} from '@/types/enums';

/**
 * Milestone 8's `/v1/flows/:flowId/triggers` surface — verified against
 * the real backend source (triggers.schemas.ts/routes.ts/service.ts).
 * Create/update/delete are ADMIN-only; list is VIEWER+ — gate the
 * management UI with `hasAtLeastRole(user.roles, 'ADMIN')`, not just by
 * hiding it optimistically, since a non-admin's call would 403 anyway.
 */

export interface ListTriggersResult {
  triggers: FlowTrigger[];
}

/** `GET /flows/:flowId/triggers` (VIEWER+). */
export async function listTriggers(flowId: string): Promise<ListTriggersResult> {
  return apiFetch<ListTriggersResult>(`/v1/flows/${flowId}/triggers`);
}

export interface CreateTriggerInput {
  sourceEvent: TriggerSourceEvent;
  targetFlowId: string;
  targetEntityResolution: TriggerTargetResolution;
  /** Required when `targetEntityResolution` is `RELATED_ENTITY` — validated server-side, not just here. */
  relationshipType?: EntityRelationshipType;
  condition?: Condition;
  isActive?: boolean;
}

/** `POST /flows/:flowId/triggers` (ADMIN+). `sourceFlowId` comes from the URL, never the body. */
export async function createTrigger(
  flowId: string,
  input: CreateTriggerInput,
): Promise<FlowTrigger> {
  return apiFetch<FlowTrigger>(`/v1/flows/${flowId}/triggers`, { method: 'POST', body: input });
}

/** `PATCH /flows/:flowId/triggers/:triggerId` (ADMIN+) — pause/resume only; full reconfiguration is delete + recreate per the real API. */
export async function updateTrigger(
  flowId: string,
  triggerId: string,
  input: { isActive: boolean },
): Promise<FlowTrigger> {
  return apiFetch<FlowTrigger>(`/v1/flows/${flowId}/triggers/${triggerId}`, {
    method: 'PATCH',
    body: input,
  });
}

/** `DELETE /flows/:flowId/triggers/:triggerId` (ADMIN+). */
export async function deleteTrigger(flowId: string, triggerId: string): Promise<void> {
  return apiFetch(`/v1/flows/${flowId}/triggers/${triggerId}`, { method: 'DELETE' });
}
