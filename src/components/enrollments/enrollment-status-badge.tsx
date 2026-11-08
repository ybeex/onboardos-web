import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { EnrollmentStatus } from '@/types/enums';

const STATUS_VARIANT: Record<EnrollmentStatus, NonNullable<BadgeProps['variant']>> = {
  ACTIVE: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
};

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
