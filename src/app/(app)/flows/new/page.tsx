'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, LayoutTemplate, FilePlus2 } from 'lucide-react';
import { listFlowTemplates, createFlowFromTemplate, createFlow } from '@/lib/api/flows';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { Select } from '@/components/ui/select';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Module } from '@/types/enums';
import { MODULE_VALUES } from '@/types/enums';

type EntryMode = 'template' | 'scratch';

/**
 * Three ways to start a flow, presented as equal peers per the UI/UX
 * doc's explicit call-out (BUILD_PLAN.md Section 5's M7 note): "AI
 * generation sits beside 'start from scratch' and 'start from
 * template,' not hidden in a menu." "Generate with AI" is a real
 * navigation to its own focused, multi-step flow (`/flows/generate`)
 * rather than a fourth inline panel here — it has its own composer,
 * async generation, preview, and refinement loop, which is too much to
 * fairly represent as "just another toggle" next to two single-step
 * options. The other two stay inline, as they were before M7, since
 * each is a single action with no multi-step flow of its own.
 */
function EntryOptionCard({
  icon: Icon,
  title,
  description,
  isActive,
  onSelect,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={cn(
        'ease-soft flex flex-col items-start gap-2 rounded-lg border p-5 text-left transition-colors duration-150',
        isActive ? 'border-brand bg-accent' : 'border-border bg-card hover:bg-muted',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md',
          isActive ? 'bg-brand text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="font-display text-foreground text-sm font-semibold">{title}</span>
      <span className="text-muted-foreground text-xs">{description}</span>
    </button>
  );
}

export default function NewFlowPage() {
  const router = useRouter();
  const [mode, setMode] = useState<EntryMode>('template');
  const [module, setModule] = useState<Module | ''>('');
  const [blankName, setBlankName] = useState('');
  const [blankModule, setBlankModule] = useState<Module | ''>('');

  const templatesQuery = useQuery({
    queryKey: ['flow-templates', module],
    queryFn: () => listFlowTemplates(module ? { module } : {}),
    enabled: mode === 'template',
  });

  const createMutation = useMutation({
    mutationFn: (templateId: string) => createFlowFromTemplate(templateId),
    onSuccess: (data) => {
      router.push(`/flows/${data.flow.id}`);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Could not create a flow from this template.',
      );
    },
  });

  const createBlankMutation = useMutation({
    mutationFn: () => {
      if (!blankModule) throw new Error('Choose a module first.');
      return createFlow({ module: blankModule, name: blankName.trim() });
    },
    onSuccess: (data) => {
      router.push(`/flows/${data.flow.id}/edit`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not create this flow.');
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <h1 className="font-display text-foreground text-2xl font-bold">Create a new flow</h1>
      <p className="text-muted-foreground mt-1">Three ways to start — pick whatever fits.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <EntryOptionCard
          icon={Sparkles}
          title="Generate with AI"
          description="Describe what you need in plain English."
          isActive={false}
          onSelect={() => {
            router.push('/flows/generate');
          }}
        />
        <EntryOptionCard
          icon={LayoutTemplate}
          title="Start from a template"
          description="Pick a proven starter flow."
          isActive={mode === 'template'}
          onSelect={() => {
            setMode('template');
          }}
        />
        <EntryOptionCard
          icon={FilePlus2}
          title="Start from scratch"
          description="Build step by step in the editor."
          isActive={mode === 'scratch'}
          onSelect={() => {
            setMode('scratch');
          }}
        />
      </div>

      {mode === 'scratch' ? (
        <div className="border-border bg-card mt-6 rounded-lg border p-5">
          <h2 className="font-display text-foreground text-base font-semibold">
            Start a blank flow
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            You&rsquo;ll land straight in the builder with zero steps — add your own from there.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Module" htmlFor="blank-module">
              {({ id }) => (
                <Select
                  id={id}
                  value={blankModule}
                  onChange={(event) => {
                    setBlankModule(event.target.value as Module | '');
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
            <Field label="Flow name" htmlFor="blank-name">
              {({ id }) => (
                <Input
                  id={id}
                  value={blankName}
                  onChange={(event) => {
                    setBlankName(event.target.value);
                  }}
                  placeholder="e.g. Sales rep onboarding"
                />
              )}
            </Field>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            isLoading={createBlankMutation.isPending}
            disabled={!blankModule || blankName.trim().length === 0}
            onClick={() => {
              createBlankMutation.mutate();
            }}
          >
            Create flow
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <Select
              value={module}
              onChange={(event) => {
                setModule(event.target.value as Module | '');
              }}
              className="w-auto"
              aria-label="Filter by module"
            >
              <option value="">All modules</option>
              {MODULE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {MODULE_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {templatesQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))
            ) : templatesQuery.isError ? (
              <p className="text-destructive text-sm">Couldn&rsquo;t load templates.</p>
            ) : templatesQuery.data && templatesQuery.data.templates.length > 0 ? (
              templatesQuery.data.templates.map((template) => (
                <div
                  key={template.id}
                  className="border-border bg-card shadow-soft-sm flex flex-col rounded-lg border p-5"
                >
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {MODULE_LABELS[template.module]}
                  </p>
                  <h3 className="font-display text-foreground mt-1 text-base font-semibold">
                    {template.name}
                  </h3>
                  {template.description ? (
                    <p className="text-muted-foreground mt-2 flex-1 text-sm">
                      {template.description}
                    </p>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    isLoading={createMutation.isPending && createMutation.variables === template.id}
                    onClick={() => {
                      createMutation.mutate(template.id);
                    }}
                  >
                    Use this template
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No templates available for this module yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
