'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Scoped to `(app)/layout.tsx`, not the root layout — marketing and
 * auth pages never call the business API, so they don't need
 * TanStack Query at all, matching this project's established "don't
 * add complexity before it's needed" pattern (Button's own comment
 * about not adding Slot/asChild prematurely is the same philosophy).
 *
 * `useState(() => new QueryClient())` is TanStack Query's own
 * documented pattern for this: a lazy initializer guarantees exactly
 * one stable client per component lifetime instead of a fresh one on
 * every render.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
