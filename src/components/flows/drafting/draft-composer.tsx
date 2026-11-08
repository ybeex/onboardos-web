'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Field, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { MODULE_VALUES } from '@/types/enums';
import type { Module } from '@/types/enums';

export interface DraftComposerProps {
  isSubmitting: boolean;
  onSubmit: (input: { module: Module; description: string }) => void;
}

/**
 * The first-generation entry point for M7's AI Flow Drafting — a real
 * textarea for the description, never a single-line input, per the
 * UI/UX doc's explicit call-out (BUILD_PLAN.md Section 5's M7 note).
 * The refinement composer is a separate, smaller component
 * (`draft-preview.tsx`'s own inline form) since it's a different shape
 * of input (a follow-up instruction against an existing draft, not a
 * from-scratch description) and only ever appears once a draft exists.
 */
export function DraftComposer({ isSubmitting, onSubmit }: DraftComposerProps) {
  const [module, setModule] = useState<Module | ''>('');
  const [description, setDescription] = useState('');

  const canSubmit = module !== '' && description.trim().length > 0 && !isSubmitting;

  return (
    <div className="border-border bg-card shadow-soft-sm rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden="true" className="text-brand h-5 w-5" />
        <h2 className="font-display text-foreground text-lg font-semibold">Describe your flow</h2>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Tell us what this onboarding flow needs to do — steps, approvals, verification, whatever
        applies. We&rsquo;ll draft a complete flow for you to review and adjust.
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Module" htmlFor="draft-module">
          {({ id }) => (
            <Select
              id={id}
              value={module}
              onChange={(event) => {
                setModule(event.target.value as Module | '');
              }}
            >
              <option value="">Choose a module</option>
              {MODULE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {MODULE_LABELS[value]}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label="What should this flow do?"
          htmlFor="draft-description"
          hint="e.g. “Onboard a new sales rep: welcome message, W-4 and direct deposit forms, manager approval, then provision their CRM account.”"
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              rows={5}
              placeholder="Describe the steps, who approves what, and any verification or e-signature needs…"
            />
          )}
        </Field>

        <Button
          variant="primary"
          isLoading={isSubmitting}
          disabled={!canSubmit}
          leadingIcon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
          onClick={() => {
            if (module === '') return;
            onSubmit({ module, description: description.trim() });
          }}
        >
          Generate flow
        </Button>
      </div>
    </div>
  );
}
