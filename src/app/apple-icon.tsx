import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Built with plain flexbox + border-radius rather than reusing
 * LogoMark's SVG (`strokeDasharray` specifically has unreliable support
 * in Satori, the HTML/CSS-to-image engine `ImageResponse` runs on) — a
 * simplified ring rendered via a bordered circle achieves the same
 * visual idea (a segmented flow/step ring) through a rendering path
 * Satori supports natively and predictably.
 *
 * The orange is a hex fallback for --palette-orange-600 because Satori
 * does not support oklch(). This isolated renderer has no access to the
 * app's CSS cascade.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#df5200',
        borderRadius: 40,
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '14px solid white',
          display: 'flex',
        }}
      />
    </div>,
    { ...size },
  );
}
