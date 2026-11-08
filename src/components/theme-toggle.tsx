'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME_ORDER = ['light', 'dark', 'system'] as const;
type ThemeOption = (typeof THEME_ORDER)[number];

const THEME_ICON: Record<ThemeOption, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_LABEL: Record<ThemeOption, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

function isThemeOption(value: string | undefined): value is ThemeOption {
  return value !== undefined && (THEME_ORDER as readonly string[]).includes(value);
}

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Cycles light -> dark -> system -> light on each click. The `mounted`
 * guard is required, not optional, with next-themes: the server has no
 * way to know the resolved theme before hydration, so rendering the
 * theme-dependent icon before mount would either mismatch the
 * server-rendered HTML or flash incorrectly on load. Rendering a
 * neutral placeholder until mounted avoids both.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // The standard next-themes hydration-safe "mounted" guard described in
    // this component's own top comment. This exact pattern is shown in
    // React's own docs and next-themes' own docs; the rule below flagging
    // it is a tracked, unconfirmed over-trigger (facebook/react#34743),
    // not a real anti-pattern to restructure around.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    setMounted(true);
  }, []);

  const current: ThemeOption = mounted && isThemeOption(theme) ? theme : 'system';
  const Icon = THEME_ICON[current];

  function handleClick(): void {
    const currentIndex = THEME_ORDER.indexOf(current);
    const next: ThemeOption = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length] ?? 'system';
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'text-muted-foreground ease-soft hover:bg-muted hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150',
        className,
      )}
      aria-label={`Theme: ${THEME_LABEL[current]}. Click to switch.`}
      title={`Theme: ${THEME_LABEL[current]}`}
    >
      {mounted ? <Icon className="h-4 w-4" aria-hidden="true" /> : <span className="h-4 w-4" />}
    </button>
  );
}
