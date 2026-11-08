'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { useAuth } from '@/lib/auth/auth-provider';
import { fieldError, cn } from '@/lib/utils';
import { passwordSchema } from '@/lib/auth/password-policy';
import { MODULES } from '@/lib/marketing/modules';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface SignupFormValues {
  tenantName: string;
  tenantSlug: string;
  fullName: string;
  email: string;
  password: string;
  initialModules: string[];
}

const signupFormSchema = z.object({
  tenantName: z.string().min(2, 'Enter your organization name').max(120, 'At most 120 characters'),
  tenantSlug: z
    .string()
    .min(2, 'Enter a workspace URL')
    .max(60, 'At most 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  fullName: z.string().min(1, 'Enter your name').max(200, 'At most 200 characters'),
  email: z.email('Enter a valid email address'),
  password: passwordSchema,
  // Genuinely optional per the real backend schema (`initialModules`
  // defaults to `[]`, with its own comment: "a tenant can activate
  // modules later from Settings without re-onboarding") — this was
  // over-tightened to `min(1)` at M3 before that was confirmed.
  initialModules: z.array(z.string()),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      tenantName: '',
      tenantSlug: '',
      fullName: '',
      email: '',
      password: '',
      initialModules: [],
    },
  });

  const passwordValue = useWatch({ control, name: 'password' });

  async function onSubmit(data: SignupFormValues): Promise<void> {
    setFormError(null);
    try {
      await signup(data);
      router.push('/dashboard');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create your account. Please try again.',
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Start free</CardTitle>
        <CardDescription>Create your OnboardOS workspace.</CardDescription>
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
            label="Organization name"
            htmlFor="signup-tenant-name"
            required
            {...fieldError(errors.tenantName?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="Acme Inc."
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('tenantName', {
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                    if (!slugTouched) {
                      setValue('tenantSlug', slugify(event.target.value), {
                        shouldValidate: false,
                      });
                    }
                  },
                })}
              />
            )}
          </Field>

          <Field
            label="Workspace URL"
            htmlFor="signup-tenant-slug"
            required
            hint="onboardos.com/acme"
            {...fieldError(errors.tenantSlug?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                placeholder="acme"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('tenantSlug', {
                  onChange: () => {
                    setSlugTouched(true);
                  },
                })}
              />
            )}
          </Field>

          <Field
            label="Your name"
            htmlFor="signup-full-name"
            required
            {...fieldError(errors.fullName?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('fullName')}
              />
            )}
          </Field>

          <Field
            label="Work email"
            htmlFor="signup-email"
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
            htmlFor="signup-password"
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
          <PasswordRequirements password={passwordValue} />

          <fieldset>
            <legend className="text-foreground text-sm font-medium">
              Which modules would you like to start with?
            </legend>
            <p className="text-muted-foreground mt-1 text-xs">
              Optional — add more later from Settings.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {MODULES.map((moduleDefinition) => (
                <label
                  key={moduleDefinition.slug}
                  className="border-input ease-soft has-[:checked]:border-brand has-[:checked]:bg-accent flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors duration-150"
                >
                  <input
                    type="checkbox"
                    value={moduleDefinition.backendValue}
                    className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
                    {...register('initialModules')}
                  />
                  {moduleDefinition.name}
                </label>
              ))}
            </div>
            {errors.initialModules ? (
              <p role="alert" className="text-destructive mt-2 text-xs">
                {errors.initialModules.message}
              </p>
            ) : null}
          </fieldset>

          {formError ? (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          ) : null}

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Create workspace
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have a workspace?{' '}
          <Link href="/login" className={cn('text-brand font-medium hover:underline')}>
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
