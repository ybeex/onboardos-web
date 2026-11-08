'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  className?: string;
  src?: string;
  alt: string;
  /** Shown while `src` is absent, or if the image fails to load — computed by the caller (see getInitials below) rather than derived internally, since "how to abbreviate a name" is a product decision, not this component's concern. */
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

/**
 * Falls back to initials on a plain `<img>` load error via local state,
 * rather than assuming every `src` will always resolve — a real,
 * common failure mode (an expired or since-deleted upload URL) that a
 * naive `src ? <img> : <initials>` check would not catch.
 */
export function Avatar({ className, src, alt, initials, size = 'md' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars are typically small, user-supplied, and often external URLs; next/image's optimization overhead isn't worth it here, and the remote host isn't known ahead of time for next.config.ts's remotePatterns.
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => {
            setImageFailed(true);
          }}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
      {/* Only needed in the fallback branch — the <img>'s own `alt`
          already provides the accessible name when it's showing, so
          rendering this unconditionally would announce the name twice. */}
      {showImage ? null : <span className="sr-only">{alt}</span>}
    </span>
  );
}

/** Shared initials-computation helper so every call site derives them identically (first letter of the first two words, uppercased). */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) return '';
  if (!last || last === first) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
