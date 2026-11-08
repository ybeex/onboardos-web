'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { createFlowDraft, getFlowDraftJob, materializeFlowDraft } from '@/lib/api/flow-drafts';
import { flowDraftJobQueryKey } from '@/lib/flows/query-keys';
import { DraftComposer } from '@/components/flows/drafting/draft-composer';
import { DraftGeneratingState } from '@/components/flows/drafting/draft-generating-state';
import { DraftPreview } from '@/components/flows/drafting/draft-preview';
import { Button } from '@/components/ui/button';
import { MODULE_VALUES } from '@/types/enums';
import type { Module } from '@/types/enums';

/** Validates an arbitrary URL query value into a real Module, never trusting it blindly — this is user-editable URL input, not internal state. */
function parseModuleParam(value: string | null): Module | null {
  if (value !== null && (MODULE_VALUES as readonly string[]).includes(value)) {
    return value as Module;
  }
  return null;
}

function ErrorPanel({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-10 text-center">
      <AlertCircle aria-hidden="true" className="text-destructive mx-auto h-8 w-8" />
      <p className="text-foreground mt-3 text-sm">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

/**
 * The M7 AI Flow Drafting flow: composer → async job polling → preview
 * (with optional refine, which is just another generate job) →
 * materialize → land in the M6 builder. Deliberately keeps `module` and
 * the active `jobId` in the URL (`?module=...&job=...`) rather than
 * only in local state — `DraftGeneratingState` tells the person it's
 * safe to navigate away, and that's only true if a refresh or a
 * back-navigation can actually resume polling the same job, not just
 * if the server-side job itself survives.
 */
export function GenerateFlowView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Tracks which copy DraftGeneratingState shows for the job currently
  // being polled — set at the moment each mutation is fired, since
  // that's the only point this component actually knows "a generate"
  // vs "a refine" is what started it (the poll itself can't tell the
  // two apart once underway).
  const [activeKind, setActiveKind] = useState<'generate' | 'refine'>('generate');

  const jobId = searchParams.get('job');
  const moduleParam = parseModuleParam(searchParams.get('module'));

  const jobQuery = useQuery({
    queryKey: flowDraftJobQueryKey(jobId ?? ''),
    queryFn: () => getFlowDraftJob(jobId ?? ''),
    enabled: jobId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 1500 : false),
  });

  const createDraftMutation = useMutation({
    mutationFn: createFlowDraft,
    onSuccess: (result, variables) => {
      router.replace(`/flows/generate?module=${variables.module}&job=${result.jobId}`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not start generating this flow.');
    },
  });

  const materializeMutation = useMutation({
    mutationFn: materializeFlowDraft,
    onSuccess: (flowDetail) => {
      toast.success('Flow created.');
      router.push(`/flows/${flowDetail.flow.id}/edit`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not create this flow.');
    },
  });

  function startOver(): void {
    router.replace('/flows/generate');
  }

  function renderBody() {
    if (jobId === null) {
      return (
        <DraftComposer
          isSubmitting={createDraftMutation.isPending}
          onSubmit={(input) => {
            setActiveKind('generate');
            createDraftMutation.mutate(input);
          }}
        />
      );
    }

    if (moduleParam === null) {
      return (
        <ErrorPanel
          message="This link is missing some information needed to continue."
          actionLabel="Start over"
          onAction={startOver}
        />
      );
    }

    if (jobQuery.isError) {
      return (
        <ErrorPanel
          message="Couldn't check on this draft's progress."
          actionLabel="Try again"
          onAction={() => void jobQuery.refetch()}
        />
      );
    }

    const jobResult = jobQuery.data;

    if (!jobResult || jobResult.status === 'PENDING') {
      return <DraftGeneratingState kind={activeKind} />;
    }

    if (jobResult.status === 'FAILED') {
      return (
        <ErrorPanel
          message={jobResult.errorMessage ?? "This draft couldn't be generated."}
          actionLabel="Start over"
          onAction={startOver}
        />
      );
    }

    if (!jobResult.draft || !jobResult.generationId) {
      return (
        <ErrorPanel
          message="This draft is missing data it needs to continue."
          actionLabel="Start over"
          onAction={startOver}
        />
      );
    }

    const { draft, generationId } = jobResult;

    return (
      <DraftPreview
        draft={draft}
        repaired={jobResult.repaired ?? false}
        isRefining={createDraftMutation.isPending}
        isMaterializing={materializeMutation.isPending}
        onRefine={(instruction) => {
          setActiveKind('refine');
          createDraftMutation.mutate({
            module: moduleParam,
            description: draft.description ?? '',
            priorDraft: draft,
            refinementInstruction: instruction,
            refinementOfGenerationId: generationId,
          });
        }}
        onMaterialize={() => {
          materializeMutation.mutate({ module: moduleParam, draft, generationId });
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
      <Link
        href="/flows/new"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back
      </Link>
      <h1 className="font-display text-foreground mt-3 text-2xl font-bold">Generate with AI</h1>
      <p className="text-muted-foreground mt-1">
        Describe the flow you need — review, refine, and bring it into the builder when it&rsquo;s
        ready.
      </p>

      <div className="mt-6">{renderBody()}</div>
    </div>
  );
}
