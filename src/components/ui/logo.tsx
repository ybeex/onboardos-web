import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/ui/logo-mark';

export interface LogoProps {
  className?: string;
  /** Controls both the mark size and the wordmark type size together, so the lockup's proportions never drift out of sync at different call sites. */
  size?: 'sm' | 'md' | 'lg';
}

const MARK_SIZE_CLASSES: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const WORDMARK_SIZE_CLASSES: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

/**
 * The standard logo lockup — mark in brand orange, wordmark in the
 * current text color (so it inherits correctly whether it's sitting on
 * a light marketing header, a dark navy hero, or the app sidebar). The
 * mark is decorative here (default `decorative` on LogoMark) since the
 * adjacent "OnboardOS" text already carries the accessible name.
 */
export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={cn('text-brand', MARK_SIZE_CLASSES[size])} />
      <span
        className={cn(
          'font-display text-foreground font-bold tracking-tight',
          WORDMARK_SIZE_CLASSES[size],
        )}
      >
        Onboard<span className="text-brand">OS</span>
      </span>
    </span>
  );
}
