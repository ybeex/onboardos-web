'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Pause, Play } from 'lucide-react';
import { listTriggers, createTrigger, updateTrigger, deleteTrigger } from '@/lib/api/triggers';
import { listFlows } from '@/lib/api/flows';
import { flowTriggersQueryKey } from '@/lib/flows/query-keys';
import { formatCondition } from '@/lib/flows/format-condition';
import {
  SimpleConditionEditor,
  emptySimpleCondition,
} from '@/components/flows/builder/step-config-forms/simple-condition-editor';
import type { SimpleCondition } from '@/components/flows/builder/step-config-forms/simple-condition-editor';
import { useAuth } from '@/lib/auth/auth-provider';
import { hasAtLeastRole } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULE_LABELS } from '@/lib/flows/labels';
import {
  TRIGGER_SOURCE_EVENT_VALUES,
  TRIGGER_TARGET_RESOLUTION_VALUES,
  ENTITY_RELATIONSHIP_TYPE_VALUES,
} from '@/types/enums';
import type {
  TriggerSourceEvent,
  TriggerTargetResolution,
  EntityRelationshipType,
} from '@/types/enums';

export interface TriggersSectionProps {
  flowId: string;
}

const SOURCE_EVENT_LABEL: Record<TriggerSourceEvent, string> = {
  ENROLLMENT_COMPLETED: 'completes',
  ENROLLMENT_FAILED: 'fails',
};

const RESOLUTION_LABEL: Record<TriggerTargetResolution, string> = {
  SAME_ENTITY: 'the same entity',
  RELATED_ENTITY: 'a related entity',
};

/** Matches the option labels already established in entity-detail-view.tsx's relationship picker — not re-derived, to avoid two slightly different phrasings of the same enum existing in the app. */
const RELATIONSHIP_LABEL: Record<EntityRelationshipType, string> = {
  STAKEHOLDER_OF: 'Stakeholder of',
  EMPLOYEE_OF: 'Employee of',
  OWNS: 'Owns',
};

function emptyCreateForm() {
  return {
    sourceEvent: 'ENROLLMENT_COMPLETED' as TriggerSourceEvent,
    targetFlowId: '',
    targetEntityResolution: 'SAME_ENTITY' as TriggerTargetResolution,
    relationshipType: 'STAKEHOLDER_OF' as EntityRelationshipType,
    useCondition: false,
    condition: emptySimpleCondition(),
  };
}

/**
 * Cross-module triggers, read by every VIEWER+ but only manageable by
 * ADMIN+ — the real API enforces this (`requireRole('ADMIN')` on
 * create/update/delete), so the add-form and per-row pause/delete
 * actions are gated client-side too, not just left to a 403 toast.
 * Condition support is deliberately limited to simple (non-compound)
 * conditions, the same scope boundary M6's own branch editor drew for
 * CONDITIONAL_BRANCH — a trigger created with a compound condition
 * (never possible from this UI) would still need to render read-only
 * via `formatCondition`, exactly like that editor's own fallback.
 */
export function TriggersSection({ flowId }: TriggersSectionProps) {
  const { user } = useAuth();
  const canManage = user ? hasAtLeastRole(user.roles, 'ADMIN') : false;
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyCreateForm());

  const triggersQuery = useQuery({
    queryKey: flowTriggersQueryKey(flowId),
    queryFn: () => listTriggers(flowId),
  });

  const flowsQuery = useQuery({
    queryKey: ['flows', 'picker', 'all'],
    queryFn: () => listFlows(),
    enabled: adding,
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: flowTriggersQueryKey(flowId) });
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createTrigger(flowId, {
        sourceEvent: form.sourceEvent,
        targetFlowId: form.targetFlowId,
        targetEntityResolution: form.targetEntityResolution,
        ...(form.targetEntityResolution === 'RELATED_ENTITY'
          ? { relationshipType: form.relationshipType }
          : {}),
        ...(form.useCondition ? { condition: form.condition } : {}),
      }),
    onSuccess: () => {
      toast.success('Trigger created.');
      setAdding(false);
      setForm(emptyCreateForm());
      void invalidate();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not create this trigger.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ triggerId, isActive }: { triggerId: string; isActive: boolean }) =>
      updateTrigger(flowId, triggerId, { isActive }),
    onSuccess: () => void invalidate(),
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not update this trigger.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (triggerId: string) => deleteTrigger(flowId, triggerId),
    onSuccess: () => {
      toast.success('Trigger deleted.');
      void invalidate();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete this trigger.');
    },
  });

  const flows = flowsQuery.data?.flows ?? [];
  const flowNameById = new Map(flows.map((flow) => [flow.id, flow.name]));

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Cross-module triggers
        </h2>
        {canManage && !adding ? (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
            }}
            className="text-brand inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            Add
          </button>
        ) : null}
      </div>

      {adding ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
          className="border-border bg-muted/40 mt-4 space-y-4 rounded-lg border p-4"
        >
          <Field label="When an enrollment here" htmlFor="trigger-event">
            {({ id }) => (
              <Select
                id={id}
                value={form.sourceEvent}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    sourceEvent: event.target.value as TriggerSourceEvent,
                  }));
                }}
              >
                {TRIGGER_SOURCE_EVENT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {SOURCE_EVENT_LABEL[value]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Enroll into" htmlFor="trigger-target">
            {({ id }) => (
              <Select
                id={id}
                value={form.targetFlowId}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, targetFlowId: event.target.value }));
                }}
                disabled={flowsQuery.isLoading}
              >
                <option value="">Select a flow…</option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name} — {MODULE_LABELS[flow.module]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Which entity" htmlFor="trigger-resolution">
            {({ id }) => (
              <Select
                id={id}
                value={form.targetEntityResolution}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    targetEntityResolution: event.target.value as TriggerTargetResolution,
                  }));
                }}
              >
                {TRIGGER_TARGET_RESOLUTION_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {RESOLUTION_LABEL[value]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {form.targetEntityResolution === 'RELATED_ENTITY' ? (
            <Field label="Relationship" htmlFor="trigger-relationship">
              {({ id }) => (
                <Select
                  id={id}
                  value={form.relationshipType}
                  onChange={(event) => {
                    setForm((prev) => ({
                      ...prev,
                      relationshipType: event.target.value as EntityRelationshipType,
                    }));
                  }}
                >
                  {ENTITY_RELATIONSHIP_TYPE_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {RELATIONSHIP_LABEL[value]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          ) : null}

          <div>
            <label className="text-foreground flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.useCondition}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, useCondition: event.target.checked }));
                }}
                className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
              />
              Only fire when…
            </label>
            {form.useCondition ? (
              <div className="mt-2">
                <SimpleConditionEditor
                  condition={form.condition}
                  onChange={(condition: SimpleCondition) => {
                    setForm((prev) => ({ ...prev, condition }));
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              disabled={!form.targetFlowId}
            >
              Create trigger
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setForm(emptyCreateForm());
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {triggersQuery.isLoading ? (
        <Skeleton className="mt-3 h-16 w-full" />
      ) : triggersQuery.data && triggersQuery.data.triggers.length > 0 ? (
        <div className="mt-3 space-y-2">
          {triggersQuery.data.triggers.map((trigger) => (
            <div
              key={trigger.id}
              className="border-border bg-card flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="text-foreground">
                  When an enrollment here {SOURCE_EVENT_LABEL[trigger.sourceEvent]} → enroll{' '}
                  {RESOLUTION_LABEL[trigger.targetEntityResolution]} into{' '}
                  <span className="font-medium">
                    {flowNameById.get(trigger.targetFlowId) ?? trigger.targetFlowId}
                  </span>
                  {trigger.relationshipType
                    ? ` (relationship: ${RELATIONSHIP_LABEL[trigger.relationshipType]})`
                    : ''}
                </p>
                {trigger.condition ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Only if {formatCondition(trigger.condition)}
                  </p>
                ) : null}
                {!trigger.isActive ? (
                  <span className="mt-1 inline-block">
                    <Badge variant="neutral">Paused</Badge>
                  </span>
                ) : null}
              </div>
              {canManage ? (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label={trigger.isActive ? 'Pause trigger' : 'Resume trigger'}
                    onClick={() => {
                      toggleMutation.mutate({ triggerId: trigger.id, isActive: !trigger.isActive });
                    }}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
                  >
                    {trigger.isActive ? (
                      <Pause aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Play aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete trigger"
                    onClick={() => {
                      deleteMutation.mutate(trigger.id);
                    }}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-md"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">No cross-module triggers configured.</p>
      )}
    </div>
  );
}
