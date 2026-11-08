import type { Metadata } from 'next';
import { TenantHealthListView } from '@/components/admin/tenant-health-list-view';

export const metadata: Metadata = { title: 'Tenants' };

export default function AdminHomePage() {
  return <TenantHealthListView />;
}
