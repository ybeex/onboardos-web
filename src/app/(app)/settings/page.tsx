import type { Metadata } from 'next';
import { Settings as SettingsIcon } from 'lucide-react';
import { ComingSoon } from '@/components/app/coming-soon';

export const metadata: Metadata = { title: 'Settings' };

/**
 * No `milestone` prop — unlike the other four placeholders, Settings
 * isn't assigned to a specific numbered milestone anywhere in
 * BUILD_PLAN.md's roadmap (only the underlying API endpoint,
 * `PATCH /tenants/me/settings`, is mentioned, with no dedicated UI
 * milestone). Naming one here would be inventing a fact the plan
 * doesn't contain.
 */
export default function SettingsPage() {
  return (
    <ComingSoon
      icon={SettingsIcon}
      title="Settings"
      description="Tenant settings — notification webhooks, module activation, and account preferences — will live here."
    />
  );
}
