import { EntityDetailView } from '@/components/entities/entity-detail-view';

interface EntityDetailPageParams {
  entityId: string;
}

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<EntityDetailPageParams>;
}) {
  const { entityId } = await params;
  return <EntityDetailView entityId={entityId} />;
}
