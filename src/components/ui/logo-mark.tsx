import type { SVGProps } from 'react';

export interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  /**
   * Set to `false` when the mark is used standalone with no adjacent
   * "OnboardOS" text nearby (e.g. a bare app icon, or the loading
   * spinner) — the mark then gets a real accessible label instead of
   * being hidden from assistive tech. Defaults to `true` (decorative)
   * because the far more common usage is paired with the wordmark via
   * `<Logo />`, where the adjacent text already says "OnboardOS."
   */
  decorative?: boolean;
}

/**
 * A ring built from rounded segments — reads as both "discrete steps in
 * a flow" (the product's actual concept) and an abstract O (for
 * OnboardOS) at a glance, legible down to favicon size. Single
 * `currentColor` throughout, deliberately: the two-tone brand feeling
 * comes from pairing this (usually `text-brand`) next to the wordmark
 * (usually `text-foreground`), the same way both reference brand marks
 * pair a single-color icon with a differently-colored wordmark, rather
 * than from the mark itself hardcoding two colors.
 */
export function LogoMark({ decorative = true, className, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'OnboardOS'}
      {...props}
    >
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="9 6.3"
      />
    </svg>
  );
}
