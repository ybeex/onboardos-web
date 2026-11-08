import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Narrower measure for text-heavy content (About, legal pages) where the default width reads as too wide a line length. */
  size?: 'default' | 'narrow';
}

/**
 * The one horizontal-rhythm primitive every marketing section uses —
 * centralizing the max-width and gutter here means every page's
 * content lines up identically without each page re-deriving it.
 */
export function Container({ className, size = 'default', ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 sm:px-8 lg:px-10',
        size === 'narrow' ? 'max-w-3xl' : 'max-w-7xl',
        className,
      )}
      {...props}
    />
  );
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * The section's background treatment. `default` is the page
   * background; `muted` is a soft tonal band for visually separating
   * adjacent sections without a hard rule; `inverse` is the bold,
   * theme-independent navy band (see globals.css's `--inverse` token
   * comment) — reserved for one deliberate moment per page, never the
   * default.
   */
  variant?: 'default' | 'muted' | 'inverse';
  /** Renders as this element instead of a bare `<section>` — used once, for the hero, which is more correctly a page header landmark. */
  as?: ElementType;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<SectionProps['variant']>, string> = {
  default: '',
  muted: 'bg-muted/50',
  inverse: 'bg-inverse text-inverse-foreground',
};

/**
 * The vertical-rhythm primitive: consistent section padding so pages
 * built from different combinations of sections still feel like one
 * continuous layout rather than a stack of independently-spaced
 * blocks.
 */
export function Section({
  className,
  variant = 'default',
  as: Component = 'section',
  children,
  ...props
}: SectionProps) {
  return (
    <Component className={cn('py-20 sm:py-28', VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </Component>
  );
}
