'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * `attribute="class"` matches globals.css's `.dark { ... }` selector
 * exactly — next-themes toggles that class on `<html>`. `system` as the
 * default respects the OS-level preference on first visit (the
 * "system-aware" requirement), while still letting a user override it
 * explicitly, persisted via next-themes' own localStorage handling.
 * `enableSystem` + `disableTransitionOnChange` avoids a jarring flash
 * of transitioning colors across the entire page the instant the theme
 * actually changes.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
