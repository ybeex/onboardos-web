import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { FlowStatus } from '@/types/enums';

const STATUS_VARIANT: Record<FlowStatus, NonNullable<BadgeProps['variant']>> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
};

const STATUS_LABEL: Record<FlowStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function FlowStatusBadge({ status }: { status: FlowStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
