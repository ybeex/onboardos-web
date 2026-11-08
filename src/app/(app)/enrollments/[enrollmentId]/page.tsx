import { EnrollmentDetailView } from '@/components/enrollments/enrollment-detail-view';

interface EnrollmentDetailPageParams {
  enrollmentId: string;
}

/**
 * `flow` is read here, server-side, as a plain prop — not via
 * `useSearchParams()` client-side (contrast `/flows/generate`'s M7
 * pattern). It's only ever an initial hint handed off by whichever page
 * linked here (the flow-scoped enrollments list, or having just created
 * this enrollment); nothing on this page ever changes it client-side
 * during the component's lifetime, so there's no reactive value to
 * track and no Suspense boundary required for it.
 */
export default async function EnrollmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<EnrollmentDetailPageParams>;
  searchParams: Promise<{ flow?: string }>;
}) {
  const { enrollmentId } = await params;
  const { flow } = await searchParams;
  return <EnrollmentDetailView enrollmentId={enrollmentId} flowId={flow ?? null} />;
}
