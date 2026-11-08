import { Suspense } from 'react';
import { GenerateFlowView } from '@/components/flows/drafting/generate-flow-view';
import { Spinner } from '@/components/ui/spinner';

/**
 * Thin server component — `GenerateFlowView`'s use of `useSearchParams()`
 * (the `?module=...&job=...` resume state) needs a Suspense boundary,
 * same reasoning as `(auth)/login/page.tsx`'s own identical split.
 */
export default function GenerateFlowPage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading" />}>
      <GenerateFlowView />
    </Suspense>
  );
}
