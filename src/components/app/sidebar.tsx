'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Workflow,
  ListChecks,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

interface SidebarLink {
  href: Route;
  label: string;
  icon: LucideIcon;
}

/** Deliberately the same six routes as proxy.ts's PROTECTED_PREFIXES (minus /admin, which is a separate auth space entirely — see that file's own comment). */
const SIDEBAR_LINKS: SidebarLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/entities', label: 'Entities', icon: Users },
  { href: '/flows', label: 'Flows', icon: Workflow },
  { href: '/enrollments', label: 'Enrollments', icon: ListChecks },
  { href: '/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-4">
      {SIDEBAR_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className={cn(
              'ease-soft flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <link.icon aria-hidden="true" className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Deliberately minimal beyond the nav itself — no nested sections, no
 * collapse-to-icons mode. Milestone 4's own scope is "sidebar... nav
 * sections mirroring the backend's modules," not a fully-featured
 * navigation system; expand here if a later milestone genuinely needs
 * more (e.g. module-scoped Flow sub-navigation).
 */
export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside className="border-border hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo />
        </div>
        <SidebarNav />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="bg-inverse/40 absolute inset-0"
            onClick={onMobileClose}
          />
          <aside className="bg-background shadow-soft-lg relative flex h-dvh w-72 flex-col">
            <div className="flex h-16 items-center justify-between px-6">
              <Logo />
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={onMobileClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
