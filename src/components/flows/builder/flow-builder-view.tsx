'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ensureFlowDraft, createStep, updateStep, deleteStep, updateFlow } from '@/lib/api/flows';
import { flowDetailQueryKey } from '@/lib/flows/query-keys';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { generateKey } from '@/lib/flows/generate-key';
import { FlowStatusBadge } from '@/components/flows/flow-status-badge';
import { StepEditorCard } from '@/components/flows/builder/step-editor-card';
import { AddStepMenu } from '@/components/flows/builder/add-step-menu';
import { NextStepSelect } from '@/components/flows/builder/step-config-forms/next-step-select';
import { Field } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Step, StepInput, FlowDetail } from '@/types/flow';

export interface FlowBuilderViewProps {
  flowId: string;
}

/**
 * A minimal, valid starting config per step type — the user fills in
 * the real content after adding it. Every step needs a client-minted
 * `key` (see @/lib/flows/generate-key) since the backend never assigns
 * one — it's the stable reference condition paths and AI-draft steps
 * use, distinct from the server-assigned `id`. FORM also needs a
 * non-empty `fields` array from the start: the backend rejects a FORM
 * step with zero fields, so an empty array here would make "add a form
 * step" silently fail on first save.
 */
function buildStepInput(type: Step['type'], title: string, position: number): StepInput {
  const key = generateKey(type);
  switch (type) {
    case 'CONTENT':
      return { type, key, title, position, nextStepId: null, config: { body: '' } };
    case 'FORM':
      return {
        type,
        key,
        title,
        position,
        nextStepId: null,
        config: { fields: [{ key: generateKey('field'), label: 'Field 1', type: 'TEXT' }] },
      };
    case 'TASK':
      return { type, key, title, position, nextStepId: null, config: {} };
    case 'APPROVAL':
      return { type, key, title, position, nextStepId: null, config: { onRejectStepId: null } };
    case 'VERIFICATION':
      return {
        type,
        key,
        title,
        position,
        nextStepId: null,
        config: { provider: 'MOCK', onRejectStepId: null },
      };
    case 'CONDITIONAL_BRANCH':
      return { type, key, title, position, nextStepId: null, config: { branches: [] } };
    case 'ESIGN':
      return { type, key, title, position, nextStepId: null, config: {} };
    case 'INTEGRATION_TRIGGER':
      return { type, key, title, position, nextStepId: null, config: {} };
  }
}

export function FlowBuilderView({ flowId }: FlowBuilderViewProps) {
  const queryClient = useQueryClient();
  const [busyStepId, setBusyStepId] = useState<string | null>(null);
  const [justAddedStepId, setJustAddedStepId] = useState<string | null>(null);

  // This query IS the "ensure a draft exists" call — ensureFlowDraft
  // returns the full FlowDetail already (see its own comment in
  // lib/api/flows.ts), so there's no separate getFlow call needed.
  // Shares flowDetailQueryKey with the read-only M5 view: landing here
  // always refreshes that same cache entry with current (possibly
  // newly-cloned) step ids, and every mutation below keeps updating
  // the same entry so navigating back to /flows/[flowId] shows fresh
  // data without an extra fetch.
  const flowQuery = useQuery({
    queryKey: flowDetailQueryKey(flowId),
    queryFn: () => ensureFlowDraft(flowId),
  });

  function setCachedFlow(updater: (old: FlowDetail) => FlowDetail): void {
    queryClient.setQueryData<FlowDetail>(flowDetailQueryKey(flowId), (old) =>
      old ? updater(old) : old,
    );
  }

  const addStepMutation = useMutation({
    mutationFn: (type: Step['type']) => {
      const position = flowQuery.data?.steps.length ?? 0;
      return createStep(flowId, buildStepInput(type, 'Untitled step', position));
    },
    onSuccess: (newStep) => {
      setCachedFlow((old) => ({ ...old, steps: [...old.steps, newStep] }));
      setJustAddedStepId(newStep.id);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not add this step.');
    },
  });

  const saveStepMutation = useMutation({
    mutationFn: ({ stepId, patch }: { stepId: string; patch: Parameters<typeof updateStep>[2] }) =>
      updateStep(flowId, stepId, patch),
    onMutate: ({ stepId }) => {
      setBusyStepId(stepId);
    },
    onSuccess: (updatedStep) => {
      setCachedFlow((old) => ({
        ...old,
        steps: old.steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)),
      }));
      toast.success('Step saved.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not save this step.');
    },
    onSettled: () => {
      setBusyStepId(null);
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => deleteStep(flowId, stepId),
    onMutate: (stepId) => {
      setBusyStepId(stepId);
    },
    onSuccess: (_data, stepId) => {
      setCachedFlow((old) => ({ ...old, steps: old.steps.filter((step) => step.id !== stepId) }));
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete this step.');
    },
    onSettled: () => {
      setBusyStepId(null);
    },
  });

  // Compares the target order against flowQuery's CACHED steps (the
  // last known-persisted state) to compute the minimal set of PATCH
  // calls needed — this only works correctly because dragOrderRef
  // below is kept separate from the cache until this mutation actually
  // succeeds. If the cache were updated optimistically during the drag
  // itself, this diff would see "no changes" and silently persist
  // nothing (a real bug caught while building this, not a hypothetical
  // one — see BUILD_PLAN.md's M6 section).
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const currentSteps = flowQuery.data?.steps ?? [];
      const changes = orderedIds
        .map((id, position) => ({ id, position }))
        .filter(
          ({ id, position }) => currentSteps.find((step) => step.id === id)?.position !== position,
        );
      await Promise.all(changes.map(({ id, position }) => updateStep(flowId, id, { position })));
      return orderedIds;
    },
    onSuccess: (orderedIds) => {
      setCachedFlow((old) => {
        const byId = new Map(old.steps.map((step) => [step.id, step]));
        const reordered = orderedIds
          .map((id, position) => {
            const step = byId.get(id);
            return step ? { ...step, position } : undefined;
          })
          .filter((step): step is Step => step !== undefined);
        return { ...old, steps: reordered };
      });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not save the new order.');
    },
    onSettled: () => {
      setDragOrder(null);
    },
  });

  // updateFlow returns the full FlowDetail (not just the Flow record),
  // and entryStepId lives on currentVersion, not flow — so the whole
  // cached detail is replaced wholesale here rather than merging one
  // field, matching what the server actually hands back.
  const entryStepMutation = useMutation({
    mutationFn: (entryStepId: string) => updateFlow(flowId, { entryStepId }),
    onSuccess: (updatedDetail) => {
      setCachedFlow(() => updatedDetail);
      toast.success('Entry step updated.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not update the entry step.');
    },
  });

  // Local, decoupled from the query cache, and only for the duration
  // of an actual drag gesture — see reorderMutation's own comment for
  // why. dragOrderRef mirrors dragOrder synchronously so onDragEnd
  // (fired once, right after the LAST onReorder call in the same
  // gesture) always reads the final order even if React hasn't
  // re-rendered with the latest state yet.
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const dragOrderRef = useRef<string[] | null>(null);

  function handleReorder(newOrder: string[]): void {
    dragOrderRef.current = newOrder;
    setDragOrder(newOrder);
  }

  function handleDragEnd(): void {
    const finalOrder = dragOrderRef.current;
    dragOrderRef.current = null;
    if (finalOrder) {
      reorderMutation.mutate(finalOrder);
    }
  }

  if (flowQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (flowQuery.isError || !flowQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this flow for editing.</p>
      </div>
    );
  }

  const { flow, currentVersion, steps } = flowQuery.data;
  const cacheSortedSteps = [...steps].sort((a, b) => a.position - b.position);
  const stepsById = new Map(cacheSortedSteps.map((step) => [step.id, step]));
  // While a drag is in flight (or its mutation hasn't settled yet),
  // render from dragOrder so the list doesn't snap back to the
  // pre-drag cache order for the moment before the PATCH calls land.
  const displayOrderedIds = dragOrder ?? cacheSortedSteps.map((step) => step.id);
  const displaySteps = displayOrderedIds
    .map((id) => stepsById.get(id))
    .filter((step): step is Step => step !== undefined);

  // Keyboard-operable alternative to the drag handle — Reorder from
  // motion/react has no built-in keyboard support, and the grip handle
  // in StepEditorCard is wired to a pointerdown-only dragControls.start,
  // so arrow-key/switch-device users had no way to reorder steps at
  // all before this. Reuses reorderMutation and dragOrder exactly as
  // handleDragEnd does, so a button move gets the same optimistic
  // "snap to new position immediately, settle dragOrder back to null
  // once the PATCH lands" treatment as a real drag gesture, rather
  // than sitting at the old position until the mutation resolves.
  function handleMoveStep(stepId: string, direction: 'up' | 'down'): void {
    const currentIndex = displayOrderedIds.indexOf(stepId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentId = displayOrderedIds[currentIndex];
    const targetId = displayOrderedIds[targetIndex];
    // Both reads are index-access under noUncheckedIndexedAccess, so
    // this doubles as the bounds check: an out-of-range targetIndex
    // (moving up from the top, down from the bottom) or a stepId that
    // somehow isn't in the list comes back undefined and is a no-op.
    if (currentId === undefined || targetId === undefined) {
      return;
    }
    const newOrder = [...displayOrderedIds];
    newOrder[currentIndex] = targetId;
    newOrder[targetIndex] = currentId;
    setDragOrder(newOrder);
    reorderMutation.mutate(newOrder);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <Link
        href={`/flows/${flowId}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to flow
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="font-display text-foreground text-2xl font-bold">Editing: {flow.name}</h1>
        <FlowStatusBadge status={currentVersion.status} />
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{MODULE_LABELS[flow.module]}</p>

      <div className="mt-6 max-w-xs">
        <Field label="Entry step" htmlFor="entry-step">
          {({ id }) => (
            <NextStepSelect
              id={id}
              value={currentVersion.entryStepId}
              onChange={(value) => {
                if (value) entryStepMutation.mutate(value);
              }}
              options={cacheSortedSteps.map((step) => ({ id: step.id, title: step.title }))}
              nullLabel="Not set"
            />
          )}
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Steps
        </h2>
        <AddStepMenu
          isAdding={addStepMutation.isPending}
          onAdd={(type) => {
            addStepMutation.mutate(type);
          }}
        />
      </div>

      {displaySteps.length === 0 ? (
        <div className="border-border mt-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">No steps yet — add one to get started.</p>
        </div>
      ) : (
        // Reorder.Group/Reorder.Item render a plain ul/li pair, and
        // Tailwind's preflight zeroes out list-style on both — which
        // in Safari/VoiceOver also silently strips the implicit
        // list/listitem ARIA role (a documented browser quirk, not a
        // Tailwind bug). role="list" here and role="listitem" on each
        // StepEditorCard's Reorder.Item restore what the CSS reset
        // took away, so the step count is still announced correctly.
        <Reorder.Group
          axis="y"
          values={displayOrderedIds}
          onReorder={handleReorder}
          role="list"
          aria-label="Flow steps"
          className="mt-3 space-y-3"
        >
          {displaySteps.map((step, index) => {
            const otherSteps = cacheSortedSteps
              .filter((candidate) => candidate.id !== step.id)
              .map((candidate) => ({ id: candidate.id, title: candidate.title }));

            return (
              <StepEditorCard
                key={step.id}
                step={step}
                index={index}
                otherSteps={otherSteps}
                isSaving={saveStepMutation.isPending && busyStepId === step.id}
                isDeleting={deleteStepMutation.isPending && busyStepId === step.id}
                autoExpand={justAddedStepId === step.id}
                onSave={(patch) => {
                  saveStepMutation.mutate({ stepId: step.id, patch });
                }}
                onDelete={() => {
                  deleteStepMutation.mutate(step.id);
                }}
                onDragEnd={handleDragEnd}
                onMoveUp={() => {
                  handleMoveStep(step.id, 'up');
                }}
                onMoveDown={() => {
                  handleMoveStep(step.id, 'down');
                }}
                isFirst={index === 0}
                isLast={index === displaySteps.length - 1}
              />
            );
          })}
        </Reorder.Group>
      )}

      {reorderMutation.isPending ? (
        <p className="text-muted-foreground mt-2 text-xs">Saving order…</p>
      ) : null}
    </div>
  );
}
