import { VerificationSessionDetailView } from '@/components/verification/verification-session-detail-view';

interface VerificationSessionPageParams {
  sessionId: string;
}

export default async function VerificationSessionPage({
  params,
}: {
  params: Promise<VerificationSessionPageParams>;
}) {
  const { sessionId } = await params;
  return <VerificationSessionDetailView sessionId={sessionId} />;
}
