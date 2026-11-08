import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { LogoMark } from '@/components/ui/logo-mark';

/**
 * One shared card for every route under `(marketing)` — no page here
 * sets its own `opengraph-image`, so this is what Next.js's file-based
 * metadata resolution falls back to for all of them (same per-segment
 * inheritance `metadata.icons` already relies on at the root layout).
 * Before this file existed, NO route in the app had an OG/Twitter
 * image at all (checked: no opengraph-image/twitter-image file
 * anywhere, no `images` key in any page's metadata, empty public/) —
 * despite the root layout already committing to
 * `twitter: { card: 'summary_large_image' }`, the one card type that
 * specifically expects a large image. Every share of every marketing
 * page was rendering as bare text with no preview.
 *
 * Scope call: this gives every marketing page the same generic brand
 * card rather than a distinct image per route. A per-module card (the
 * `modules/[module]` pages each already have distinct
 * title/description via their own generateMetadata) would be a
 * reasonable follow-up, but is new per-page surface area beyond this
 * pass's "fix the gap" scope, not a gap in what M2 already established.
 */
export const alt = 'OnboardOS — Onboarding, unified';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Read the SAME font files the `geist` package already ships and the
  // root layout already loads via next/font/local — not a duplicated
  // asset, just read directly here since ImageResponse (Satori) needs
  // raw font bytes up front and can't consume a next/font loader
  // result or a CSS @font-face reference the way a browser can.
  const fontsDir = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');
  const [geistRegular, geistBold] = await Promise.all([
    readFile(join(fontsDir, 'Geist-Regular.ttf')),
    readFile(join(fontsDir, 'Geist-Bold.ttf')),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        // --navy-900: the design system's one deliberately-fixed
        // "bold navy" brand surface (see globals.css's --inverse
        // comment) — the OKLCH token converted to sRGB hex, since
        // Satori's CSS support doesn't parse oklch(). Verified
        // against a real browser's computed style, not hand-rolled
        // math alone (see BUILD_PLAN.md's M10 section).
        background: '#050a1a',
        padding: '96px',
      }}
    >
      <LogoMark style={{ color: '#df5200', width: 72, height: 72 }} />
      <div
        style={{
          marginTop: 40,
          fontSize: 84,
          // 700 to match the real site's own h1 weight (font-bold —
          // see (marketing)/page.tsx's hero heading), not an
          // arbitrarily-picked weight for this image alone.
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: 'Geist',
          letterSpacing: '-0.02em',
        }}
      >
        OnboardOS
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 36,
          fontWeight: 400,
          // --navy-300, this design system's muted-foreground pairing
          // for text on the --inverse navy surface.
          color: '#9ba5b8',
          fontFamily: 'Geist',
        }}
      >
        Onboarding, unified
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Geist', data: geistRegular, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
