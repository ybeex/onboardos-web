import type { PlatformAdminRole } from '@/types/enums';

/** Human-readable labels for `PlatformAdminRole` — mirrors `@/lib/flows/labels.ts`'s `MODULE_LABELS` pattern. */
export const PLATFORM_ADMIN_ROLE_LABELS: Record<PlatformAdminRole, string> = {
  SUPPORT: 'Support',
  COMPLIANCE: 'Compliance',
  ENG_ON_CALL: 'Eng On-Call',
  REVOPS: 'RevOps',
  SUPER: 'Super Admin',
};
