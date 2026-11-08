import type { Metadata } from 'next';
import { EnrollmentsListView } from '@/components/enrollments/enrollments-list-view';

export const metadata: Metadata = { title: 'Enrollments' };

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>;
}) {
  const { flow } = await searchParams;
  return <EnrollmentsListView initialFlowId={flow ?? null} />;
}
