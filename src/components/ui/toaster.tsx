'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * Passes next-themes' own `resolvedTheme` into sonner explicitly rather
 * than letting sonner's `theme="system"` do its own independent
 * media-query detection — two separate "what's the current theme"
 * detectors could theoretically disagree for a moment; one source of
 * truth avoids that entirely.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-lg border border-border bg-card text-card-foreground shadow-soft-md font-sans',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
