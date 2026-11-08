'use client';

import { useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContentConfigForm } from '@/components/flows/builder/step-config-forms/content-config-form';
import { FormConfigForm } from '@/components/flows/builder/step-config-forms/form-config-form';
import { TaskConfigForm } from '@/components/flows/builder/step-config-forms/task-config-form';
import { ApprovalConfigForm } from '@/components/flows/builder/step-config-forms/approval-config-form';
import { VerificationConfigForm } from '@/components/flows/builder/step-config-forms/verification-config-form';
import { ConditionalBranchConfigForm } from '@/components/flows/builder/step-config-forms/conditional-branch-config-form';
import { NextStepSelect } from '@/components/flows/builder/step-config-forms/next-step-select';
import type { StepOption } from '@/components/flows/builder/step-config-forms/next-step-select';
import type { Step } from '@/types/flow';
import { STEP_TYPE_ICON, STEP_TYPE_LABEL } from '@/lib/flows/step-type-display';
import { cn } from '@/lib/utils';

/** Base `nextStepId`'s meaning is type-specific — see StepSummaryCard's identical reasoning (same inferred-vs-confirmed split) for APPROVAL/VERIFICATION/CONDITIONAL_BRANCH. */
function nextStepFieldLabel(type: Step['type']): string {
  switch (type) {
    case 'APPROVAL':
      return 'If approved, go to';
    case 'VERIFICATION':
      return 'If verified, go to';
    case 'CONDITIONAL_BRANCH':
      return 'If no branch matches, go to';
    default:
      return 'Then go to';
  }
}

/** Renders the right typed config form for a step, narrowing via switch (reliable for a discriminated union — chained ternary equality checks were not, see simple-condition-editor.tsx's history). */
function renderConfigForm(
  step: Step,
  onConfigChange: (config: Step['config']) => void,
  otherSteps: StepOption[],
) {
  switch (step.type) {
    case 'CONTENT':
      return <ContentConfigForm config={step.config} onChange={onConfigChange} />;
    case 'FORM':
      return <FormConfigForm config={step.config} onChange={onConfigChange} />;
    case 'TASK':
      return <TaskConfigForm config={step.config} onChange={onConfigChange} />;
    case 'APPROVAL':
      return (
        <ApprovalConfigForm
          config={step.config}
          onChange={onConfigChange}
          otherSteps={otherSteps}
        />
      );
    case 'VERIFICATION':
      return (
        <VerificationConfigForm
          config={step.config}
          onChange={onConfigChange}
          otherSteps={otherSteps}
        />
      );
    case 'CONDITIONAL_BRANCH':
      return (
        <ConditionalBranchConfigForm
          config={step.config}
          onChange={onConfigChange}
          otherSteps={otherSteps}
        />
      );
    case 'ESIGN':
    case 'INTEGRATION_TRIGGER':
      return (
        <p className="text-muted-foreground text-sm">No configuration needed for this step type.</p>
      );
  }
}

export interface StepEditorCardProps {
  step: Step;
  index: number;
  otherSteps: StepOption[];
  isSaving: boolean;
  isDeleting: boolean;
  /** True for the step just created via AddStepMenu — saves the user an extra click to start configuring it. */
  autoExpand: boolean;
  onSave: (patch: { title: string; config: Step['config']; nextStepId: string | null }) => void;
  onDelete: () => void;
  /** Fired once when this card's own drag gesture ends — see FlowBuilderView's reorderMutation comment for why persistence happens here, not in onReorder. */
  onDragEnd: () => void;
  /** Keyboard-operable alternative to the pointer-only drag handle below — see FlowBuilderView's handleMoveStep comment. */
  onMoveUp: () => void;
  onMoveDown: () => void;
  /** Disable the corresponding move button instead of letting it no-op silently. */
  isFirst: boolean;
  isLast: boolean;
}

export function StepEditorCard({
  step,
  index,
  otherSteps,
  isSaving,
  isDeleting,
  autoExpand,
  onSave,
  onDelete,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: StepEditorCardProps) {
  const [expanded, setExpanded] = useState(autoExpand);
  const [draftTitle, setDraftTitle] = useState(step.title);
  const [draftConfig, setDraftConfig] = useState<Step['config']>(step.config);
  const [draftNextStepId, setDraftNextStepId] = useState<string | null>(step.nextStepId);
  const dragControls = useDragControls();
  const Icon = STEP_TYPE_ICON[step.type];

  function handleExpand(): void {
    setDraftTitle(step.title);
    setDraftConfig(step.config);
    setDraftNextStepId(step.nextStepId);
    setExpanded(true);
  }

  function handleSave(): void {
    // Cast is safe: draftConfig is always initialized from and only
    // ever mutated by this same step's own type-specific config form,
    // so its shape matches step.type even though the local state's
    // declared type (Step['config'], the full config union) can't
    // express that correlation the way the discriminated Step type does.
    onSave({ title: draftTitle, config: draftConfig, nextStepId: draftNextStepId });
  }

  return (
    <Reorder.Item
      value={step.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      role="listitem"
      className="border-border bg-card shadow-soft-sm rounded-lg border"
    >
      <div className="flex items-center gap-3 p-4">
        {/*
          Stacked with the grip handle because motion/react's Reorder has no
          built-in keyboard support: dragControls.start only ever fires from
          onPointerDown below, so without these two buttons a keyboard or
          switch-device user could not reorder steps at all. Each is a
          complete move (calls FlowBuilderView's reorderMutation directly),
          not a focus-then-drag affordance.
        */}
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move step up"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-4 w-4 items-center justify-center rounded disabled:opacity-50"
          >
            <ArrowUp aria-hidden="true" className="h-3 w-3" />
          </button>
          <button
            type="button"
            onPointerDown={(event) => {
              dragControls.start(event);
            }}
            aria-label="Drag to reorder"
            className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVertical aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move step down"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-4 w-4 items-center justify-center rounded disabled:opacity-50"
          >
            <ArrowDown aria-hidden="true" className="h-3 w-3" />
          </button>
        </div>
        <span className="bg-accent text-accent-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {index + 1}
        </span>
        <Icon aria-hidden="true" className="text-muted-foreground h-4 w-4 shrink-0" />
        <Badge variant="neutral">{STEP_TYPE_LABEL[step.type]}</Badge>
        <p className="font-display text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
          {step.title}
        </p>
        <button
          type="button"
          onClick={() => {
            onDelete();
          }}
          aria-label="Delete step"
          disabled={isDeleting}
          className="text-muted-foreground hover:bg-muted hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (expanded) {
              setExpanded(false);
            } else {
              handleExpand();
            }
          }}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          aria-expanded={expanded}
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn('h-4 w-4 transition-transform duration-150', expanded && 'rotate-180')}
          />
        </button>
      </div>

      {expanded ? (
        <div className="border-border space-y-4 border-t p-4">
          <Field label="Title" htmlFor={`step-title-${step.id}`} required>
            {({ id }) => (
              <Input
                id={id}
                value={draftTitle}
                onChange={(event) => {
                  setDraftTitle(event.target.value);
                }}
              />
            )}
          </Field>

          {renderConfigForm({ ...step, config: draftConfig } as Step, setDraftConfig, otherSteps)}

          <Field label={nextStepFieldLabel(step.type)} htmlFor={`step-next-${step.id}`}>
            {({ id }) => (
              <NextStepSelect
                id={id}
                value={draftNextStepId}
                onChange={setDraftNextStepId}
                options={otherSteps}
                nullLabel="End of flow"
              />
            )}
          </Field>

          <div className="flex gap-2">
            <Button
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!draftTitle.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </Reorder.Item>
  );
}
