import { z } from 'zod';

/**
 * Best-effort reconstruction of onboardos-backend's real signup
 * password rule. BUILD_PLAN.md Section 4 only partially specifies it
 * ("min 12 chars, mixed case, etc." — the M3 milestone note itself,
 * not a full contract) and that whole section is explicitly "a careful
 * reconstruction from memory... verify against the actual backend
 * source if it's available." This file is the one place that
 * reconstruction lives — if the real rule turns out to differ, this
 * is the only file that needs correcting; every consumer (the signup
 * form, the signup route handler's server-side re-check, and the live
 * checklist UI) reads from here rather than each guessing separately.
 */
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `At least ${String(PASSWORD_MIN_LENGTH)} characters`)
  .max(PASSWORD_MAX_LENGTH, `At most ${String(PASSWORD_MAX_LENGTH)} characters`)
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number');

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

/** Drives PasswordRequirements' live checklist. Kept in this same file as passwordSchema so the two can't silently drift apart. */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: `At least ${String(PASSWORD_MIN_LENGTH)} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /[0-9]/.test(value) },
];
