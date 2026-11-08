import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { VerificationSessionStatus } from '@/types/enums';

const STATUS_VARIANT: Record<VerificationSessionStatus, NonNullable<BadgeProps['variant']>> = {
  PENDING: 'info',
  APPROVED: 'success',
  DECLINED: 'danger',
  NEEDS_REVIEW: 'warning',
  EXPIRED: 'neutral',
};

const STATUS_LABEL: Record<VerificationSessionStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  NEEDS_REVIEW: 'Needs review',
  EXPIRED: 'Expired',
};

export function VerificationSessionStatusBadge({ status }: { status: VerificationSessionStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
