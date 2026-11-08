'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Building2, UserCog } from 'lucide-react';
import { getTenantHealth, setTenantModules, impersonate } from '@/lib/api/admin';
import { tenantHealthDetailQueryKey } from '@/lib/admin/query-keys';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { hasAnyPlatformRole, MODULE_VALUES } from '@/types/enums';
import type { Module } from '@/types/enums';
import { MODULE_LABELS } from '@/lib/flows/labels';
import { Stat } from '@/components/admin/stat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldError } from '@/lib/utils';
import type { TenantHealthSummary } from '@/types/admin';

export interface TenantHealthDetailViewProps {
  tenantId: string;
}

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface ModuleOverrideFormValues {
  activeModules: Module[];
  reason: string;
}

const moduleOverrideSchema = z.object({
  activeModules: z.array(z.enum(MODULE_VALUES)),
  // Mirrors the verified `SetTenantModulesInput.reason` contract exactly
  // (10-500 chars, audited verbatim) — see BUILD_PLAN.md Section 4.
  reason: z
    .string()
    .min(10, 'Explain why, in at least 10 characters — this is written to the audit log')
    .max(500, 'At most 500 characters'),
});

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface ImpersonateFormValues {
  userId: string;
  reason: string;
}

const impersonateFormSchema = z.object({
  userId: z.string(),
  // Mirrors the verified `ImpersonateInput.reason` contract exactly
  // (10-500 chars, written into the audit log alongside every action
  // taken under the resulting token) — see BUILD_PLAN.md Section 4.
  reason: z
    .string()
    .min(10, 'Explain why, in at least 10 characters — this is written to the audit log')
    .max(500, 'At most 500 characters'),
});

/**
 * `/admin/tenants/:tenantId` — the detail half of `GET /admin/tenants`,
 * which (per `TenantHealthSummary`'s own comment) returns the IDENTICAL
 * shape as a list row. There is no richer drill-down available (no user
 * list, no flow list) beyond the same counts the list page already
 * shows per-row, so this page's summary section deliberately doesn't
 * imply more data exists than the API actually provides.
 *
 * The module-override form is the one piece of real functionality here,
 * and it's gated to REVOPS (+ SUPER, automatically, via
 * `hasAnyPlatformRole`) — matching `PUT /admin/tenants/:id/modules`'s
 * verified allow-list exactly. A SUPPORT/COMPLIANCE/ENG_ON_CALL admin
 * sees the tenant summary with no form at all, not a disabled one —
 * the same "don't show what their own call would 403 on" honesty
 * `AdminTopbar` applies to its nav links.
 *
 * The impersonate form is gated to SUPPORT (+ SUPER) — ENG_ON_CALL is
 * deliberately excluded from impersonation itself per the verified
 * contract, even though it CAN manage feature flags elsewhere in this
 * admin UI; these are non-overlapping allow-lists, not a hierarchy (see
 * `hasAnyPlatformRole`'s own comment). A successful grant is handed
 * straight to the TENANT app's OWN `useAuth()` — imported here
 * deliberately, the one narrow, documented crossing of the two
 * otherwise-separate auth stacks in this entire codebase (every other
 * admin component only ever touches `useAdminAuth()`). See
 * `AuthProvider.beginImpersonation`'s own comment for why that's safe:
 * `ImpersonateResult` and `SessionBootstrapResponse` are structurally
 * the same shape, so the admin stack hands off a value, not control —
 * nothing here reaches INTO the tenant provider's internals, it just
 * calls the one function built to receive this handoff.
 */
export function TenantHealthDetailView({ tenantId }: TenantHealthDetailViewProps) {
  const { admin } = useAdminAuth();
  const { beginImpersonation } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasInitializedForm = useRef(false);
  const [isImpersonateFormOpen, setIsImpersonateFormOpen] = useState(false);

  const tenantQuery = useQuery({
    queryKey: tenantHealthDetailQueryKey(tenantId),
    queryFn: () => getTenantHealth(tenantId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ModuleOverrideFormValues>({
    resolver: zodResolver(moduleOverrideSchema),
    defaultValues: { activeModules: [], reason: '' },
  });

  // Seeds the form from the loaded tenant exactly once. A plain
  // `reset(tenant.activeModules)` on every render of this effect would
  // also fire on TanStack Query's background refetches (`staleTime` is
  // 30s, not infinite — see `QueryProvider`), silently discarding an
  // admin's in-progress checkbox/reason edits out from under them. The
  // ref makes the seed a one-time initialization instead.
  useEffect(() => {
    if (hasInitializedForm.current || !tenantQuery.data) return;
    hasInitializedForm.current = true;
    reset({ activeModules: tenantQuery.data.activeModules, reason: '' });
  }, [tenantQuery.data, reset]);

  const overrideMutation = useMutation({
    mutationFn: (values: ModuleOverrideFormValues) =>
      setTenantModules(tenantId, { activeModules: values.activeModules, reason: values.reason }),
    onSuccess: (result) => {
      toast.success('Modules updated.');
      queryClient.setQueryData<TenantHealthSummary>(
        tenantHealthDetailQueryKey(tenantId),
        (current) => (current ? { ...current, activeModules: result.activeModules } : current),
      );
      // Prefix-invalidates both the detail key above AND every
      // `tenantHealthListQueryKey(...)` variant in one call — they all
      // start with ['admin', 'tenants', ...], and a tenant's list row
      // shows `activeModules` too. See query-keys.ts's own comment.
      void queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      reset({ activeModules: result.activeModules, reason: '' });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not update modules.');
    },
  });

  const {
    register: registerImpersonate,
    handleSubmit: handleImpersonateSubmit,
    formState: { errors: impersonateErrors },
  } = useForm<ImpersonateFormValues>({
    resolver: zodResolver(impersonateFormSchema),
    defaultValues: { userId: '', reason: '' },
  });

  const impersonateMutation = useMutation({
    mutationFn: (values: ImpersonateFormValues) =>
      impersonate({
        tenantId,
        ...(values.userId.trim() ? { userId: values.userId.trim() } : {}),
        reason: values.reason,
      }),
    onSuccess: (result) => {
      toast.success('Impersonation started.');
      // The handoff: an impersonation grant becomes a real TENANT
      // session via the SAME `applySession` path a normal login uses —
      // see `beginImpersonation`'s own comment. `router.push` (client-
      // side transition), never a hard navigation — a full reload would
      // remount `AuthProvider` and lose this in-memory session before
      // `/dashboard` ever renders it (see `proxy.ts`'s own comment on
      // the marker cookie this call's BFF route just set, which is what
      // lets this specific navigation through).
      beginImpersonation({
        user: result.impersonatedUser,
        tenant: result.impersonatedTenant,
        accessToken: result.accessToken,
        expiresInSeconds: result.expiresInSeconds,
      });
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not start impersonation.');
    },
  });

  if (tenantQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (tenantQuery.isError || !tenantQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this tenant.</p>
      </div>
    );
  }

  const tenant = tenantQuery.data;
  const canOverrideModules = admin ? hasAnyPlatformRole(admin.role, ['REVOPS']) : false;
  const canImpersonate = admin ? hasAnyPlatformRole(admin.role, ['SUPPORT']) : false;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
      <Link
        href="/admin"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Tenants
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="bg-accent text-accent-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
          <Building2 aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold">{tenant.tenantName}</h1>
          <p className="text-muted-foreground text-sm">{tenant.tenantSlug}</p>
        </div>
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        Created {new Date(tenant.createdAt).toLocaleDateString()}
      </p>

      <div className="border-border bg-card mt-6 flex justify-around rounded-lg border p-5">
        <Stat label="Users" value={tenant.userCount} />
        <Stat label="Flows" value={tenant.flowCount} />
        <Stat label="Entities" value={tenant.entityCount} />
        <Stat label="Active enrollments" value={tenant.activeEnrollmentCount} />
      </div>

      <div className="mt-6">
        <h2 className="text-foreground text-sm font-medium">Active modules</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tenant.activeModules.length > 0 ? (
            tenant.activeModules.map((activeModule) => (
              <Badge key={activeModule} variant="brand">
                {MODULE_LABELS[activeModule]}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No modules active.</p>
          )}
        </div>
      </div>

      {canOverrideModules ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Override modules</CardTitle>
            <CardDescription>
              Replaces this tenant&rsquo;s full active-modules list. Every change is written to the
              audit log with the reason given below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                void handleSubmit((values) => {
                  overrideMutation.mutate(values);
                })(event);
              }}
              noValidate
              className="space-y-4"
            >
              <fieldset>
                <legend className="text-foreground text-sm font-medium">Modules</legend>
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  {MODULE_VALUES.map((moduleValue) => (
                    <label
                      key={moduleValue}
                      className="border-input ease-soft has-[:checked]:border-brand has-[:checked]:bg-accent flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        value={moduleValue}
                        className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
                        {...register('activeModules')}
                      />
                      {MODULE_LABELS[moduleValue]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Reason"
                htmlFor="override-reason"
                required
                {...fieldError(errors.reason?.message)}
              >
                {({ id, describedBy, invalid }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    placeholder="Why is this changing?"
                    {...register('reason')}
                  />
                )}
              </Field>

              <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                Update modules
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canImpersonate ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Impersonate</CardTitle>
            <CardDescription>
              Opens this tenant&rsquo;s own dashboard under their identity, in this browser tab. A
              persistent banner stays visible for the whole session, and every action taken under it
              is audited alongside the reason given below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isImpersonateFormOpen ? (
              <form
                onSubmit={(event) => {
                  void handleImpersonateSubmit((values) => {
                    impersonateMutation.mutate(values);
                  })(event);
                }}
                noValidate
                className="space-y-4"
              >
                <Field
                  label="User ID"
                  htmlFor="impersonate-user-id"
                  hint="Leave blank to impersonate the tenant's OWNER."
                >
                  {({ id }) => (
                    <Input id={id} placeholder="Optional" {...registerImpersonate('userId')} />
                  )}
                </Field>

                <Field
                  label="Reason"
                  htmlFor="impersonate-reason"
                  required
                  {...fieldError(impersonateErrors.reason?.message)}
                >
                  {({ id, describedBy, invalid }) => (
                    <Textarea
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      placeholder="Why do you need to view this tenant as its own user?"
                      {...registerImpersonate('reason')}
                    />
                  )}
                </Field>

                <div className="flex gap-2">
                  <Button type="submit" isLoading={impersonateMutation.isPending}>
                    <UserCog aria-hidden="true" className="h-4 w-4" />
                    Start impersonating
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsImpersonateFormOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImpersonateFormOpen(true);
                }}
              >
                <UserCog aria-hidden="true" className="h-4 w-4" />
                Impersonate this tenant
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
