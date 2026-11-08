'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { fieldError } from '@/lib/utils';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface AdminLoginFormValues {
  email: string;
  password: string;
}

const adminLoginFormSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

/**
 * Deliberately the tenant `LoginForm`'s closest sibling, not a copy: no
 * `tenantSlug` field (platform admins aren't scoped to a tenant — see
 * BUILD_PLAN.md Section 4), and no post-login `next` redirect-back —
 * this always lands on `/admin` on success. That's a real scope
 * simplification, not an oversight: admin sessions are short, low
 * frequency, and start-from-the-dashboard by design (no refresh token
 * either — see `AdminAuthProvider`'s header comment), so the extra
 * `useSearchParams()` + `Suspense` split the tenant form needs for its
 * redirect-back isn't worth adding here.
 */
export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: AdminLoginFormValues): Promise<void> {
    setFormError(null);
    try {
      await login(data);
      router.push('/admin');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Platform admin sign in</CardTitle>
        <CardDescription>
          Internal staff only — this is a separate sign-in from the OnboardOS workspace app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          noValidate
          className="space-y-4"
        >
          <Field
            label="Email"
            htmlFor="admin-login-email"
            required
            {...fieldError(errors.email?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="email"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('email')}
              />
            )}
          </Field>
          <Field
            label="Password"
            htmlFor="admin-login-password"
            required
            {...fieldError(errors.password?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="password"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('password')}
              />
            )}
          </Field>
          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}
          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
