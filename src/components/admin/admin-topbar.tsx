'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';
import { Avatar, getInitials } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { hasAnyPlatformRole } from '@/types/enums';
import { PLATFORM_ADMIN_ROLE_LABELS } from '@/lib/admin/labels';
import { cn } from '@/lib/utils';

interface AdminNavLink {
  href: Route;
  label: string;
}

const BASE_NAV_LINKS: AdminNavLink[] = [
  { href: '/admin', label: 'Tenants' },
  { href: '/admin/feature-flags', label: 'Feature Flags' },
];

/**
 * A single horizontal nav bar, not `Sidebar` + `AppTopbar` split in
 * two — three admin pages total doesn't earn a collapsible sidebar's
 * complexity (mobile-open state, a second component, its own
 * `SidebarLink` list); this is the same "don't add structure before
 * it's needed" judgment call the tenant app shell's own components
 * document elsewhere in this codebase. If M9's surface grows
 * significantly later, revisit then.
 *
 * "Impersonation Activity" is appended to the nav only when the signed-
 * in admin's role can actually see it (`SUPPORT, COMPLIANCE,
 * ENG_ON_CALL` — REVOPS is deliberately excluded per the verified
 * backend contract, BUILD_PLAN.md Section 4) — hiding a link a REVOPS
 * admin's own call would 403 on is honest UI, not just tidiness.
 */
export function AdminTopbar() {
  const { admin, logout } = useAdminAuth();
  const pathname = usePathname();
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

  const navLinks: AdminNavLink[] =
    admin && hasAnyPlatformRole(admin.role, ['SUPPORT', 'COMPLIANCE', 'ENG_ON_CALL'])
      ? [
          ...BASE_NAV_LINKS,
          { href: '/admin/impersonation-activity', label: 'Impersonation Activity' },
        ]
      : BASE_NAV_LINKS;

  function handleLogout(): void {
    logout();
    router.push('/admin/login');
  }

  return (
    <header className="border-border flex h-16 items-center justify-between gap-4 border-b px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <Badge variant="neutral">Admin</Badge>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'ease-soft rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

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
              alt={admin?.fullName ?? ''}
              initials={admin ? getInitials(admin.fullName) : ''}
              size="sm"
            />
          </button>

          {menuOpen ? (
            <div className="border-border bg-card shadow-soft-lg absolute top-full right-0 mt-2 w-60 rounded-lg border p-1">
              <div className="px-3 py-2">
                <p className="text-foreground truncate text-sm font-medium">{admin?.fullName}</p>
                <p className="text-muted-foreground truncate text-xs">{admin?.email}</p>
                {admin ? (
                  <Badge variant="brand" className="mt-1.5">
                    {PLATFORM_ADMIN_ROLE_LABELS[admin.role]}
                  </Badge>
                ) : null}
              </div>
              <div className="border-border my-1 border-t" />
              <button
                type="button"
                onClick={handleLogout}
                className="text-foreground ease-soft hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
