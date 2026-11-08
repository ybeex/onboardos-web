/**
 * Every cross-cutting enum from BUILD_PLAN.md Section 4, defined once
 * here so every future milestone imports the same names rather than
 * re-deriving them locally.
 *
 * Each type is paired with a `_VALUES` runtime array. This is NOT the
 * `z.infer<>` pattern README.md's "Type conventions" bans — that rule
 * (enforced by eslint.config.mjs) is specifically about not coupling
 * app-facing types to a Zod schema's internals. Deriving a type from a
 * hand-written `as const` array via `(typeof X_VALUES)[number]` is a
 * different, ordinary TypeScript idiom with no Zod involvement at all;
 * it's used here in preference to maintaining the type and the array
 * as two separately hand-written lists, which would only add a silent
 * drift risk (nothing would catch the array missing a value the type
 * has) for no real benefit over this single-source-of-truth version.
 */

export const ENTITY_TYPE_VALUES = ['PERSON', 'ACCOUNT'] as const;
export type EntityType = (typeof ENTITY_TYPE_VALUES)[number];

export const MODULE_VALUES = ['EMPLOYEE', 'PRODUCT', 'CLIENT', 'IDENTITY'] as const;
export type Module = (typeof MODULE_VALUES)[number];

export const STEP_TYPE_VALUES = [
  'CONTENT',
  'FORM',
  'TASK',
  'ESIGN',
  'APPROVAL',
  'VERIFICATION',
  'INTEGRATION_TRIGGER',
  'CONDITIONAL_BRANCH',
] as const;
export type StepType = (typeof STEP_TYPE_VALUES)[number];

export const FLOW_STATUS_VALUES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type FlowStatus = (typeof FLOW_STATUS_VALUES)[number];

export const FLOW_CREATED_VIA_VALUES = ['MANUAL', 'TEMPLATE', 'AI'] as const;
export type FlowCreatedVia = (typeof FLOW_CREATED_VIA_VALUES)[number];

export const ENROLLMENT_STATUS_VALUES = ['ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUS_VALUES)[number];

export const STEP_EXECUTION_STATUS_VALUES = [
  'PENDING',
  'ACTIVE',
  'WAITING',
  'COMPLETED',
  'FAILED',
] as const;
export type StepExecutionStatus = (typeof STEP_EXECUTION_STATUS_VALUES)[number];

export const VERIFICATION_SESSION_STATUS_VALUES = [
  'PENDING',
  'APPROVED',
  'DECLINED',
  'NEEDS_REVIEW',
  'EXPIRED',
] as const;
export type VerificationSessionStatus = (typeof VERIFICATION_SESSION_STATUS_VALUES)[number];

export const VERIFICATION_PROVIDER_VALUES = ['PERSONA', 'VERIFF', 'MOCK'] as const;
export type VerificationProvider = (typeof VERIFICATION_PROVIDER_VALUES)[number];

export const TENANT_ROLE_VALUES = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'] as const;
export type TenantRole = (typeof TENANT_ROLE_VALUES)[number];

/**
 * Tenant roles are a ranked hierarchy, not an unordered set: a user holds
 * an ARRAY of roles (see AuthUser.roles in @/types/auth), and an access
 * check passes if the HIGHEST rank among them meets the requirement.
 * Verified against the real backend's src/modules/auth/rbac.ts
 * (`ROLE_RANK` + `hasAtLeastRole`) — this mirrors that logic exactly so
 * the frontend's notion of "can this user do X" never drifts from the
 * backend's.
 */
const TENANT_ROLE_RANK: Record<TenantRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasAtLeastRole(userRoles: TenantRole[], required: TenantRole): boolean {
  if (userRoles.length === 0) return false;
  const highest = Math.max(...userRoles.map((role) => TENANT_ROLE_RANK[role]));
  return highest >= TENANT_ROLE_RANK[required];
}

export const PLATFORM_ADMIN_ROLE_VALUES = [
  'SUPPORT',
  'COMPLIANCE',
  'ENG_ON_CALL',
  'REVOPS',
  'SUPER',
] as const;
export type PlatformAdminRole = (typeof PLATFORM_ADMIN_ROLE_VALUES)[number];

/**
 * Platform-admin roles are an ALLOW-LIST per capability, NOT a ranked
 * hierarchy like `hasAtLeastRole` above — verified against the real
 * backend's src/modules/platform-admin/platform-admin.rbac.ts
 * (`requirePlatformRole`). SUPPORT, COMPLIANCE, ENG_ON_CALL, and REVOPS
 * are four non-overlapping specialist slices with no ordering among
 * them (there is no single line that correctly ranks "COMPLIANCE vs.
 * ENG_ON_CALL"); SUPER is a superset every route's allow-list includes
 * automatically, not the top of a rank the other four sit below. DO NOT
 * reuse `hasAtLeastRole` for platform-admin checks — it would silently
 * grant or deny the wrong roles. This mirrors `requirePlatformRole`'s
 * own automatic-SUPER-inclusion behavior exactly: SUPER always passes,
 * regardless of whether it's explicitly listed in `allowed`.
 */
export function hasAnyPlatformRole(role: PlatformAdminRole, allowed: PlatformAdminRole[]): boolean {
  return role === 'SUPER' || allowed.includes(role);
}

export const ENTITY_RELATIONSHIP_TYPE_VALUES = ['STAKEHOLDER_OF', 'EMPLOYEE_OF', 'OWNS'] as const;
export type EntityRelationshipType = (typeof ENTITY_RELATIONSHIP_TYPE_VALUES)[number];

/**
 * Verified against the real backend (db/schema/onboarding.schema.ts's
 * `TRIGGER_SOURCE_EVENT_VALUES`/`TRIGGER_TARGET_RESOLUTION_VALUES`) for
 * Milestone 8's cross-module triggers. A trigger fires when an
 * enrollment on its source flow reaches `sourceEvent`, then resolves a
 * target entity per `targetEntityResolution` — see `@/types/flow`'s
 * `FlowTrigger` for the full shape.
 */
export const TRIGGER_SOURCE_EVENT_VALUES = ['ENROLLMENT_COMPLETED', 'ENROLLMENT_FAILED'] as const;
export type TriggerSourceEvent = (typeof TRIGGER_SOURCE_EVENT_VALUES)[number];

export const TRIGGER_TARGET_RESOLUTION_VALUES = ['SAME_ENTITY', 'RELATED_ENTITY'] as const;
export type TriggerTargetResolution = (typeof TRIGGER_TARGET_RESOLUTION_VALUES)[number];

/**
 * Verified against the real backend
 * (db/schema/feature-flags.schema.ts's `FEATURE_FLAG_SCOPE_VALUES`) for
 * Milestone 9's Super Admin Dashboard. `TENANT`-scoped rows override a
 * `GLOBAL` row of the same `key` for that one tenant — see
 * `@/types/admin`'s `FeatureFlag`.
 */
export const FEATURE_FLAG_SCOPE_VALUES = ['GLOBAL', 'TENANT'] as const;
export type FeatureFlagScope = (typeof FEATURE_FLAG_SCOPE_VALUES)[number];
