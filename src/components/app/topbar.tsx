'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, LogOut } from 'lucide-react';
import { Avatar, getInitials } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth/auth-provider';
import { cn } from '@/lib/utils';

export interface AppTopbarProps {
  onMobileMenuClick: () => void;
  onSearchClick: () => void;
}

/**
 * Deliberately minimal beyond the user menu itself — Milestone 4's own
 * scope is "topbar (user menu using the Avatar primitive, ThemeToggle)."
 * No breadcrumbs, no page title slot; add those if a later milestone's
 * pages actually need them.
 */
export function AppTopbar({ onMobileMenuClick, onSearchClick }: AppTopbarProps) {
  const { user, tenant, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout(): Promise<void> {
    await logout();
    router.push('/');
  }

  return (
    <header className="border-border flex h-16 items-center justify-between gap-4 border-b px-4 sm:px-6">
      <button
        type="button"
        onClick={onMobileMenuClick}
        aria-label="Open menu"
        className="text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onSearchClick}
        className="border-input bg-background text-muted-foreground ease-soft hover:border-ring hidden flex-1 items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 sm:flex sm:max-w-xs"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        Search or jump to…
        <kbd className="border-border bg-muted text-muted-foreground ml-auto rounded border px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Search"
        className="text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full sm:hidden"
      >
        <Search aria-hidden="true" className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((isOpen) => !isOpen);
            }}
            aria-expanded={menuOpen}
            aria-label="Account menu"
            className="ease-soft rounded-full transition-opacity duration-150 hover:opacity-80"
          >
            <Avatar
              alt={user?.fullName ?? ''}
              initials={user ? getInitials(user.fullName) : ''}
              size="sm"
            />
          </button>

          {menuOpen ? (
            <div className="border-border bg-card shadow-soft-lg absolute top-full right-0 mt-2 w-56 rounded-lg border p-1">
              <div className="px-3 py-2">
                <p className="text-foreground truncate text-sm font-medium">{user?.fullName}</p>
                <p className="text-muted-foreground truncate text-xs">{tenant?.name}</p>
              </div>
              <div className="border-border my-1 border-t" />
              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                className={cn(
                  'text-foreground ease-soft hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150',
                )}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
