import type { Metadata } from 'next';
import { FeatureFlagsView } from '@/components/admin/feature-flags-view';

export const metadata: Metadata = { title: 'Feature Flags' };

export default function AdminFeatureFlagsPage() {
  return <FeatureFlagsView />;
}
