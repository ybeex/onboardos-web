import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

/**
 * Anticipates the route structure upcoming milestones add: the
 * authenticated tenant app, the platform-admin surface, and the BFF
 * route handlers should never be crawled or indexed — only the public
 * marketing site (Milestone 2) is meant to appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/entities',
        '/flows',
        '/enrollments',
        '/verification',
        '/settings',
        '/admin',
        '/api',
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
