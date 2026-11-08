import type { MetadataRoute } from 'next';

/**
 * Theme/background colors here are literal, same documented exception
 * as layout.tsx's viewport.themeColor and app/icon.svg — the manifest
 * is a standalone JSON file with no access to the app's CSS cascade.
 * Matches --palette-white / --palette-orange-600 exactly.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OnboardOS',
    short_name: 'OnboardOS',
    description: 'One platform for every onboarding journey.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: 'oklch(0.62 0.19 42)',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
