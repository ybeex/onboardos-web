import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWithBackend } from '@/lib/auth/backend-auth';
import { passwordSchema } from '@/lib/auth/password-policy';
import { MODULE_VALUES } from '@/types/enums';

const signupProxySchema = z.object({
  tenantName: z.string().min(2).max(120),
  tenantSlug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  fullName: z.string().min(1).max(200),
  email: z.email(),
  password: passwordSchema,
  initialModules: z.array(z.enum(MODULE_VALUES)).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = signupProxySchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? 'Invalid signup request.' },
      { status: 400 },
    );
  }

  const result = await authenticateWithBackend('/v1/auth/signup', parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
