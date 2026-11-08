'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { listVerificationSessions } from '@/lib/api/verification';
import { verificationSessionsQueryKey } from '@/lib/verification/query-keys';
import { VerificationSessionStatusBadge } from '@/components/verification/verification-session-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VerificationStepConfig } from '@/types/flow';

export interface VerificationStepActionProps {
  stepExecutionId: string;
  config: VerificationStepConfig;
}

/**
 * Deliberately read-only — no approve/reject form here. A VERIFICATION
 * step's decision is made by the KYC partner's webhook or by a human
 * resolving a NEEDS_REVIEW case, and both paths bottom out at the same
 * `resolveSessionDecision` on the backend, which always acts through
 * the verification session object, never a bare `{decision}` POSTed
 * straight to the generic step-complete endpoint. Routing a manual
 * approve/reject through here would bypass the session history and the
 * manual-review queue entirely — this view only ever points at that
 * session (via `/verification/[sessionId]`) rather than duplicating its
 * resolution UI. See `@/lib/api/enrollments`'s `CompleteStepInput` for
 * the same note from the other side.
 */
export function VerificationStepAction({ stepExecutionId, config }: VerificationStepActionProps) {
  const sessionsQuery = useQuery({
    queryKey: verificationSessionsQueryKey({ stepExecutionId }),
    queryFn: () => listVerificationSessions({ stepExecutionId }),
    // A session is created as a side effect strictly after the step
    // became WAITING, not inside the same transaction — a short poll
    // covers the gap instead of showing "no session" as if that were
    // the final state.
    refetchInterval: (query) =>
      query.state.data && query.state.data.sessions.length > 0 ? false : 2000,
  });

  if (sessionsQuery.isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  const sessions = sessionsQuery.data?.sessions ?? [];
  // Sessions aren't guaranteed sorted by the API beyond id order (ULIDs
  // sort chronologically, so this is already newest-last); take the
  // last one defensively rather than assuming array order.
  const latest = sessions[sessions.length - 1];

  if (!latest) {
    return (
      <p className="text-muted-foreground text-sm">
        Starting a {config.provider.toLowerCase()} verification session…
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          Verification ({config.provider.toLowerCase()}):
        </span>
        <VerificationSessionStatusBadge status={latest.status} />
      </div>
      {latest.status === 'PENDING' && latest.redirectUrl ? (
        <a
          href={latest.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand inline-flex items-center gap-1.5 font-medium hover:underline"
        >
          Open verification link
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </a>
      ) : null}
      {latest.status === 'NEEDS_REVIEW' ? (
        <Link
          href={`/verification/${latest.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Review this case
        </Link>
      ) : null}
    </div>
  );
}
