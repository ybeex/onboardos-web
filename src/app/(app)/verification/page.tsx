'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { listVerificationSessions } from '@/lib/api/verification';
import { verificationSessionsQueryKey } from '@/lib/verification/query-keys';
import { VerificationSessionStatusBadge } from '@/components/verification/verification-session-status-badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { VERIFICATION_SESSION_STATUS_VALUES } from '@/types/enums';
import type { VerificationSessionStatus } from '@/types/enums';

/**
 * Defaults to the manual-review queue (`status=NEEDS_REVIEW`) — the
 * brief's primary job for this page — with the full status range one
 * filter change away for "visibility into every automated verification,
 * provider, and outcome." Plain local state, no query-string
 * persistence, matching `/flows/page.tsx`'s own filter pattern.
 */
export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationSessionStatus | ''>('NEEDS_REVIEW');

  const sessionsQuery = useQuery({
    queryKey: verificationSessionsQueryKey(status ? { status } : {}),
    queryFn: () => listVerificationSessions(status ? { status } : {}),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <h1 className="font-display text-foreground text-2xl font-bold">Verification</h1>
      <p className="text-muted-foreground mt-1">
        The manual review queue for identity checks that need a human decision, plus visibility into
        every automated verification.
      </p>

      <div className="mt-6">
        <Select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as VerificationSessionStatus | '');
          }}
          className="w-auto"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {VERIFICATION_SESSION_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase().replace('_', ' ')}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {sessionsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : sessionsQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load verification sessions. Please try again.
          </p>
        ) : sessionsQuery.data && sessionsQuery.data.sessions.length > 0 ? (
          sessionsQuery.data.sessions.map((session) => (
            <Link
              key={session.id}
              href={`/verification/${session.id}`}
              className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-foreground truncate text-sm font-semibold">
                    {session.provider.charAt(0) + session.provider.slice(1).toLowerCase()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <VerificationSessionStatusBadge status={session.status} />
            </Link>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              {status === 'NEEDS_REVIEW'
                ? 'Nothing needs review right now.'
                : status === ''
                  ? 'No verification sessions yet.'
                  : 'No verification sessions match this filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
