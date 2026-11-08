import type { Metadata } from 'next';
import { TenantHealthDetailView } from '@/components/admin/tenant-health-detail-view';

interface TenantDetailPageParams {
  tenantId: string;
}

export const metadata: Metadata = { title: 'Tenant' };

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<TenantDetailPageParams>;
}) {
  const { tenantId } = await params;
  return <TenantHealthDetailView tenantId={tenantId} />;
}
