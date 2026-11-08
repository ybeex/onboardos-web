import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import type { EntityType } from '@/types/enums';

const TYPE_VARIANT: Record<EntityType, NonNullable<BadgeProps['variant']>> = {
  PERSON: 'info',
  ACCOUNT: 'neutral',
};

const TYPE_LABEL: Record<EntityType, string> = {
  PERSON: 'Person',
  ACCOUNT: 'Account',
};

export function EntityTypeBadge({ type }: { type: EntityType }) {
  return <Badge variant={TYPE_VARIANT[type]}>{TYPE_LABEL[type]}</Badge>;
}
