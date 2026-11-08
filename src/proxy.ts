import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { REFRESH_TOKEN_COOKIE_NAME, IMPERSONATION_COOKIE_NAME } from '@/lib/auth/constants';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/entities',
  '/flows',
  '/enrollments',
  '/verification',
  '/settings',
];
const AUTH_PAGES = ['/login', '/signup'];

/**
 * Named `proxy.ts` / `export function proxy`, not `middleware.ts` /
 * `middleware` — Next.js 16 deprecated and renamed the file
 * convention (confirmed against the current Next.js docs this
 * session; `next build` surfaced the deprecation warning). The
 * `config`/`matcher` export shape below is unchanged from the old
 * convention. One behavioral difference worth knowing: Proxy now
 * defaults to the Node.js runtime rather than Edge — irrelevant to
 * this file's own logic, but worth knowing before assuming Edge-only
 * APIs are unavailable here.
 *
 * An OPTIMISTIC check only — presence of EITHER cookie below, not
 * cryptographic validation of either. Nothing here can meaningfully
 * validate the httpOnly refresh-token cookie even given a Node.js
 * runtime: per .env.example it's an opaque backend value, not a
 * decodable JWT, so there's no signature or claims to check without an
 * extra network call this file deliberately avoids adding to every
 * request. This exists purely to avoid rendering a protected page's
 * shell for a request with no session at all — AuthProvider's
 * client-side bootstrap-refresh (lib/auth/auth-provider.tsx) is what
 * actually proves a normal session is valid. This is the "optimistic
 * redirect here, real check close to the data" split Next.js's own
 * auth guidance recommends for exactly this in-memory-access-token
 * architecture.
 *
 * The second cookie, IMPERSONATION_COOKIE_NAME, covers a session that
 * has no refresh token at all (an admin impersonating a tenant user,
 * BUILD_PLAN.md Section 4) and therefore none of
 * REFRESH_TOKEN_COOKIE_NAME either — without it, this file would see no
 * session whatsoever for an impersonating admin's first request into a
 * protected route and bounce them to /login before AuthProvider's
 * in-memory state (set client-side via `beginImpersonation` just before
 * that navigation) ever gets a chance to render. It carries no data of
 * its own, same "presence only" treatment as the refresh cookie — see
 * `lib/auth/impersonation-cookie.ts`.
 *
 * `/admin` is deliberately NOT in PROTECTED_PREFIXES, and — now that
 * Milestone 9 has actually built that section — deliberately never
 * will be, not merely "not yet." The tenant check above works by
 * reading a cookie this file (server-side) can see without running any
 * client JS. Platform-admin sessions have no refresh token AT ALL
 * (BUILD_PLAN.md Section 4) — no cookie, no server-visible signal of
 * any kind, only an in-memory access token that exists purely in the
 * browser's React state. There is nothing for a proxy-layer check to
 * read here, so the "optimistic redirect here, real check close to the
 * data" split this file uses for the tenant app has no optimistic half
 * to add for `/admin` — only the real half exists, entirely client-side
 * in `src/app/admin/(dashboard)/layout.tsx`'s own guard. This isn't a
 * gap to close later; it's the correct shape given the verified
 * backend contract, and adding `/admin` here would just be dead code
 * with nothing meaningful to check.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSessionCookie =
    request.cookies.has(REFRESH_TOKEN_COOKIE_NAME) ||
    request.cookies.has(IMPERSONATION_COOKIE_NAME);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);
  if (isAuthPage && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/entities/:path*',
    '/flows/:path*',
    '/enrollments/:path*',
    '/verification/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
