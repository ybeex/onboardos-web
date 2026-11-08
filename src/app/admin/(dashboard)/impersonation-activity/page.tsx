import type { Metadata } from 'next';
import { ImpersonationActivityView } from '@/components/admin/impersonation-activity-view';

export const metadata: Metadata = { title: 'Impersonation Activity' };

export default function AdminImpersonationActivityPage() {
  return <ImpersonationActivityView />;
}
