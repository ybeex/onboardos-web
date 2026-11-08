'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ThumbsUp, ThumbsDown, RotateCcw, ExternalLink } from 'lucide-react';
import {
  getVerificationSession,
  resolveManualDecision,
  requestReverification,
} from '@/lib/api/verification';
import { verificationSessionDetailQueryKey } from '@/lib/verification/query-keys';
import { VerificationSessionStatusBadge } from '@/components/verification/verification-session-status-badge';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { VerificationSession } from '@/types/verification';

export interface VerificationSessionDetailViewProps {
  sessionId: string;
}

export function VerificationSessionDetailView({ sessionId }: VerificationSessionDetailViewProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const sessionQuery = useQuery({
    queryKey: verificationSessionDetailQueryKey(sessionId),
    queryFn: () => getVerificationSession(sessionId),
  });

  const decisionMutation = useMutation({
    mutationFn: (decision: 'approved' | 'rejected') =>
      resolveManualDecision(
        sessionId,
        notes.trim() ? { decision, notes: notes.trim() } : { decision },
      ),
    onSuccess: (session, decision) => {
      queryClient.setQueryData<VerificationSession>(
        verificationSessionDetailQueryKey(sessionId),
        session,
      );
      toast.success(decision === 'approved' ? 'Approved.' : 'Declined.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not resolve this case.');
    },
  });

  const reverifyMutation = useMutation({
    mutationFn: () => requestReverification(sessionId),
    onSuccess: () => {
      toast.success('A new verification session was started for this step.');
      void queryClient.invalidateQueries({
        queryKey: verificationSessionDetailQueryKey(sessionId),
      });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not request re-verification.');
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this verification session.</p>
      </div>
    );
  }

  const session = sessionQuery.data;

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-8">
      <Link
        href="/verification"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to queue
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-foreground text-2xl font-bold">
          {session.provider.charAt(0) + session.provider.slice(1).toLowerCase()} verification
        </h1>
        <VerificationSessionStatusBadge status={session.status} />
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Created {new Date(session.createdAt).toLocaleString()}
      </p>

      <dl className="border-border bg-card mt-6 divide-y rounded-lg border text-sm">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-muted-foreground">Enrollment</dt>
          <dd>
            <Link
              href={`/enrollments/${session.enrollmentId}`}
              className="text-brand hover:underline"
            >
              View enrollment
            </Link>
          </dd>
        </div>
        {session.decisionReason ? (
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted-foreground">Decision reason</dt>
            <dd className="text-foreground text-right">{session.decisionReason}</dd>
          </div>
        ) : null}
        {session.redirectUrl ? (
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted-foreground">Capture link</dt>
            <dd>
              <a
                href={session.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand inline-flex items-center gap-1.5 hover:underline"
              >
                Open
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {session.status === 'NEEDS_REVIEW' ? (
        <div className="border-border bg-card shadow-soft-sm mt-6 rounded-lg border p-5">
          <h2 className="font-display text-foreground text-sm font-semibold">Resolve this case</h2>
          <div className="mt-3">
            <Field label="Notes (optional)" htmlFor="manual-decision-notes">
              {({ id }) => (
                <Textarea
                  id={id}
                  rows={3}
                  value={notes}
                  onChange={(event) => {
                    setNotes(event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              isLoading={decisionMutation.isPending && decisionMutation.variables === 'approved'}
              disabled={decisionMutation.isPending}
              leadingIcon={<ThumbsUp aria-hidden="true" className="h-4 w-4" />}
              onClick={() => {
                decisionMutation.mutate('approved');
              }}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={decisionMutation.isPending && decisionMutation.variables === 'rejected'}
              disabled={decisionMutation.isPending}
              leadingIcon={<ThumbsDown aria-hidden="true" className="h-4 w-4" />}
              onClick={() => {
                decisionMutation.mutate('rejected');
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      ) : null}

      {session.status !== 'APPROVED' ? (
        <div className="mt-6">
          <Button
            variant="ghost"
            size="sm"
            isLoading={reverifyMutation.isPending}
            leadingIcon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
            onClick={() => {
              reverifyMutation.mutate();
            }}
          >
            Request re-verification
          </Button>
          <p className="text-muted-foreground mt-1 text-xs">
            Starts a fresh session for the same step — e.g. after a false rejection. The enrollment
            must still be active.
          </p>
        </div>
      ) : null}
    </div>
  );
}
