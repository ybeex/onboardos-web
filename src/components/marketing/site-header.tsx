'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavLink {
  href: Route;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/modules', label: 'Modules' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

/**
 * Always `sticky` with a permanent translucent-blur background rather
 * than a scroll-triggered solid/transparent swap — the latter needs a
 * scroll listener and a hydration-safe "am I scrolled yet" guard for
 * comparatively little visual payoff. This reads cleanly over any hero
 * content without the extra moving part.
 *
 * Client component for the mobile nav's open/close state and for
 * `usePathname` — used only to auto-close the mobile panel on
 * navigation, not for any route-matching/active-link styling (with 4
 * flat nav links, "which one is active" is rarely ambiguous enough to
 * be worth the added visual noise).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Closes the mobile panel on navigation. Adjusted directly during
  // render (React's own documented pattern for "reset state when a
  // value changes") rather than in a useEffect — this avoids the
  // render-then-effect-then-re-render waterfall an effect would cause
  // here, unlike the ThemeToggle mounted-guard case, which has no
  // render-time equivalent and is a different, justified pattern (see
  // that file's own comment).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setMobileOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground ease-soft hover:text-foreground text-sm font-medium transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'md' }))}>
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}>
            Start free
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              setMobileOpen((open) => !open);
            }}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="text-foreground ease-soft hover:bg-muted inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav-panel"
          className="border-border bg-background shadow-soft-lg border-t px-6 pt-2 pb-6 lg:hidden"
        >
          <nav aria-label="Primary" className="flex flex-col gap-1 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground ease-soft hover:bg-muted rounded-md px-3 py-2.5 text-base font-medium transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-border mt-3 flex flex-col gap-2 border-t pt-4">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
            >
              Start free
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
