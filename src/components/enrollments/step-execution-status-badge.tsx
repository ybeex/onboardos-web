import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { StepExecutionStatus } from '@/types/enums';

const STATUS_VARIANT: Record<StepExecutionStatus, NonNullable<BadgeProps['variant']>> = {
  PENDING: 'neutral',
  ACTIVE: 'info',
  WAITING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
};

const STATUS_LABEL: Record<StepExecutionStatus, string> = {
  PENDING: 'Upcoming',
  ACTIVE: 'In progress',
  WAITING: 'Needs action',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export function StepExecutionStatusBadge({ status }: { status: StepExecutionStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
