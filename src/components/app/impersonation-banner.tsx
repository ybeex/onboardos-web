'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';

/**
 * Renders for the entire duration of an admin's impersonation session —
 * see `AuthProvider.beginImpersonation`'s own comment for the full
 * handoff this is the visible half of. Mounted in `(app)/layout.tsx`
 * OUTSIDE the normal shell's flex row — full width, above the
 * sidebar/topbar, never scrolled out of view or visually subordinate to
 * the rest of the chrome. This is the one thing an admin acting as
 * someone else should never be able to lose track of, so it isn't a
 * dismissible toast or a collapsible strip; it's there for as long as
 * `useAuth().isImpersonating` is true and nothing in this component
 * offers a way to hide it short of actually ending the session.
 *
 * `border-current`/`text-current` on the button deliberately inherit
 * this banner's own `text-warning-foreground` rather than reaching for
 * Button's default `outline` colors — `--warning-foreground` is tuned
 * per theme specifically for legibility ON `--warning` (white text in
 * light mode, navy in dark, per globals.css), which `text-foreground`
 * alone doesn't know to do.
 */
export function ImpersonationBanner() {
  const { user, tenant, endImpersonation } = useAuth();
  const [isEnding, setIsEnding] = useState(false);

  async function handleEnd(): Promise<void> {
    setIsEnding(true);
    try {
      await endImpersonation();
    } finally {
      setIsEnding(false);
    }
  }

  return (
    <div className="bg-warning text-warning-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
        Viewing as {user?.fullName ?? 'this user'} at {tenant?.name ?? 'this tenant'}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        isLoading={isEnding}
        onClick={() => {
          void handleEnd();
        }}
        className="h-7 border-current px-3 text-current hover:bg-black/10"
      >
        End impersonation
      </Button>
    </div>
  );
}
