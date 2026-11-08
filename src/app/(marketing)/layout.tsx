import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Own layout for the public site, matching BUILD_PLAN.md Section 7's
 * `(marketing)` route group — keeps the header/footer scoped here so
 * they never leak into the authenticated app shell M4 builds, or the
 * (auth)/admin surfaces, which each own their own chrome.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
