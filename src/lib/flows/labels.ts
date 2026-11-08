import type { Module } from '@/types/enums';

/**
 * Deliberately separate from `lib/marketing/modules.ts` — that file's
 * own header comment scopes it to "presentation copy for the public
 * site, not a runtime contract." This is the authenticated app's own
 * minimal module-label mapping, with no marketing copy attached.
 */
export const MODULE_LABELS: Record<Module, string> = {
  EMPLOYEE: 'Employee',
  PRODUCT: 'Product',
  CLIENT: 'Client',
  IDENTITY: 'Identity',
};
