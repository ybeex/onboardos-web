import { FlowDetailView } from '@/components/flows/flow-detail-view';

interface FlowDetailPageParams {
  flowId: string;
}

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<FlowDetailPageParams>;
}) {
  const { flowId } = await params;
  return <FlowDetailView flowId={flowId} />;
}
