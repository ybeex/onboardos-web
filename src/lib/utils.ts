import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving conflicting Tailwind utilities in favor
 * of whichever was passed later (so a consumer's `className="p-8"` can
 * correctly override a component's own default `p-4`, rather than both
 * classes landing in the DOM and CSS source order deciding the winner).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * react-hook-form's `errors.field?.message` types as `string | undefined`
 * explicitly, which `exactOptionalPropertyTypes` (tsconfig.json) rejects
 * when passed straight into an optional `error?: string` prop (Field,
 * and any future field-level component built the same way) — passing
 * `undefined` explicitly isn't the same as omitting the prop under that
 * flag. Spread this instead of passing the message directly:
 * `{...fieldError(errors.name?.message)}` gives a real `error` prop only
 * when there's an actual message, and no prop at all otherwise.
 */
export function fieldError(message: string | undefined): { error: string } | Record<string, never> {
  return message ? { error: message } : {};
}
