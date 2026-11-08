'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { fieldError } from '@/lib/utils';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface LoginFormValues {
  tenantSlug: string;
  email: string;
  password: string;
}

const loginFormSchema = z.object({
  tenantSlug: z.string().min(1, 'Enter your workspace'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

/**
 * `path.startsWith('/')` alone is NOT enough here — `//evil.com` also
 * starts with `/` and browsers treat it as protocol-relative, i.e. a
 * full off-site redirect (a classic open-redirect vector for exactly
 * this "redirect back to `next`" pattern). Excluding `//` closes that.
 */
function isSafeRedirectPath(path: string | null): path is string {
  return path !== null && path.startsWith('/') && !path.startsWith('//');
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { tenantSlug: '', email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues): Promise<void> {
    setFormError(null);
    try {
      await login(data);
      const next = searchParams.get('next');
      // The only spot in this app that casts to Route: `next` is
      // inherently a runtime value (wherever middleware sent the user
      // from), not something typedRoutes can know statically. The
      // isSafeRedirectPath guard above is the actual safety check;
      // this cast just satisfies the type system once that's done.
      router.push((isSafeRedirectPath(next) ? next : '/dashboard') as Route);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Sign in to your OnboardOS workspace.</CardDescription>
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
            label="Workspace"
            htmlFor="login-tenant-slug"
            required
            {...fieldError(errors.tenantSlug?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="acme"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('tenantSlug')}
              />
            )}
          </Field>
          <Field
            label="Email"
            htmlFor="login-email"
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
            htmlFor="login-password"
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
            Log in
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&rsquo;t have a workspace yet?{' '}
          <Link href="/signup" className="text-brand font-medium hover:underline">
            Start free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
