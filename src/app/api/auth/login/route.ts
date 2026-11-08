import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWithBackend } from '@/lib/auth/backend-auth';

const loginProxySchema = z.object({
  tenantSlug: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = loginProxySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }

  const result = await authenticateWithBackend('/v1/auth/login', parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
