import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Deliberately minimal — Milestone 3 owns the real auth experience
 * (BUILD_PLAN.md Section 7 slots Login/Signup under this exact route
 * group). This centers content and gives both pages a consistent,
 * on-brand frame in the meantime; M3 is free to expand this (e.g. a
 * split marketing/art panel) without moving any files.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/">
        <Logo size="lg" />
      </Link>
      {children}
    </div>
  );
}
