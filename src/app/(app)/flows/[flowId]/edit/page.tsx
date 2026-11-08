import { FlowBuilderView } from '@/components/flows/builder/flow-builder-view';

interface FlowEditPageParams {
  flowId: string;
}

export default async function FlowEditPage({ params }: { params: Promise<FlowEditPageParams> }) {
  const { flowId } = await params;
  return <FlowBuilderView flowId={flowId} />;
}
