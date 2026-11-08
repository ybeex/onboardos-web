import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setImpersonationCookie, clearImpersonationCookie } from '@/lib/auth/impersonation-cookie';
import type { ImpersonateResult } from '@/lib/api/admin';

const impersonateProxySchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1).optional(),
  reason: z.string().min(10).max(500),
});

async function extractBackendErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Backend didn't return JSON — fall through to the fallback.
  }
  return 'Could not start impersonation. Please try again.';
}

/**
 * The ONE admin-side route this app proxies through the Next.js server
 * — every other `/admin/*` call goes straight from the browser to the
 * backend (`adminApiFetch`, see BUILD_PLAN.md Section 4: no refresh
 * token means no BFF is needed for admin auth itself). Impersonation is
 * different: its result has to become a real session in the TENANT
 * app (a completely separate auth stack, `@/lib/auth/*`), and that
 * stack's `proxy.ts` needs a server-visible cookie to let the
 * impersonating admin's first request into a protected tenant route —
 * only a Route Handler can set that cookie (see
 * `impersonation-cookie.ts`). This route's only job is: forward the
 * call to the real backend with the admin's own bearer token (attached
 * manually below — there's no session here to read it from
 * automatically the way a logged-in browser's own cookies would), set
 * that marker cookie on success, and hand back the identical response
 * body untouched. The actual access token still never touches a cookie
 * — it rides in this JSON body straight into `AuthProvider`'s in-memory
 * state via `beginImpersonation`, same as every other access token in
 * this app.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing admin session.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = impersonateProxySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid impersonation request.' }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/v1/admin/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return NextResponse.json(
      { error: 'Could not reach the server. Please try again.' },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const message = await extractBackendErrorMessage(response);
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const data = (await response.json()) as ImpersonateResult;
  await setImpersonationCookie(data.expiresInSeconds);

  return NextResponse.json(data);
}

/**
 * Ends the impersonation session's one piece of server-visible state.
 * No backend call — there's nothing to revoke server-side (no refresh
 * token was ever issued for this session to begin with, mirroring why
 * `AdminAuthProvider.logout()` itself is purely client-side too); the
 * tenant app's in-memory session is cleared separately, directly by
 * `AuthProvider.endImpersonation()`, which calls this route only for
 * this cookie.
 */
export async function DELETE(): Promise<NextResponse> {
  await clearImpersonationCookie();
  return NextResponse.json({ ok: true });
}
