'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, X } from 'lucide-react';
import { listFeatureFlags, upsertFeatureFlag, deleteFeatureFlag } from '@/lib/api/admin';
import type { UpsertFeatureFlagInput } from '@/lib/api/admin';
import { featureFlagsQueryKey } from '@/lib/admin/query-keys';
import { useAdminAuth } from '@/lib/admin-auth/admin-auth-provider';
import { hasAnyPlatformRole, FEATURE_FLAG_SCOPE_VALUES } from '@/types/enums';
import type { FeatureFlagScope } from '@/types/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldError } from '@/lib/utils';
import type { FeatureFlag } from '@/types/admin';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface FeatureFlagFormValues {
  key: string;
  scope: FeatureFlagScope;
  tenantId: string;
  isEnabled: boolean;
  description: string;
}

const EMPTY_FORM: FeatureFlagFormValues = {
  key: '',
  scope: 'GLOBAL',
  tenantId: '',
  isEnabled: true,
  description: '',
};

const featureFlagFormSchema = z
  .object({
    key: z
      .string()
      .min(1, 'Required')
      .max(100, 'At most 100 characters')
      .regex(/^[a-z0-9_.]+$/, 'Lowercase letters, numbers, underscores, and dots only'),
    scope: z.enum(FEATURE_FLAG_SCOPE_VALUES),
    tenantId: z.string(),
    isEnabled: z.boolean(),
    description: z.string().max(500, 'At most 500 characters'),
  })
  // `tenantId` is required iff `scope` is TENANT, enforced server-side too
  // (see UpsertFeatureFlagInput's own comment) — mirrored here so the
  // error surfaces before a round trip, not just via the API's own 400.
  .refine((data) => data.scope === 'GLOBAL' || data.tenantId.trim().length > 0, {
    message: 'Required for a tenant-scoped flag',
    path: ['tenantId'],
  });

/**
 * `/admin/feature-flags` — visible to every platform-admin role (`GET`
 * is unrestricted), but the create/edit/delete form and per-row actions
 * are gated to ENG_ON_CALL (+ SUPER), matching the verified `PUT`/
 * `DELETE` allow-list exactly. A SUPPORT/COMPLIANCE/REVOPS admin sees
 * the flag list read-only, no form — same "don't show a control their
 * own call would 403 on" rule the tenant module-override form and
 * `AdminTopbar`'s nav both already follow.
 *
 * `PUT /admin/feature-flags` is a true upsert keyed on (key, scope,
 * tenantId) — there is no separate edit endpoint. "Editing" a row here
 * is really just pre-filling those three identity fields into the same
 * create form and locking them, so a submit can only ever update that
 * exact row rather than accidentally minting a new one if an admin
 * tweaked the key mid-edit.
 */
export function FeatureFlagsView() {
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [tenantFilter, setTenantFilter] = useState('');
  const [editingFlagId, setEditingFlagId] = useState<string | null>(null);

  const canManage = admin ? hasAnyPlatformRole(admin.role, ['ENG_ON_CALL']) : false;
  const trimmedFilter = tenantFilter.trim() || undefined;

  const flagsQuery = useQuery({
    queryKey: featureFlagsQueryKey(trimmedFilter),
    queryFn: () => listFeatureFlags(trimmedFilter),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FeatureFlagFormValues>({
    resolver: zodResolver(featureFlagFormSchema),
    defaultValues: EMPTY_FORM,
  });

  // `useWatch`, not `watch()` — the same React-Compiler-friendly choice
  // `signup-form.tsx` already makes, for the same reason (`watch()`
  // returns a function the compiler can't safely memoize).
  const scope = useWatch({ control, name: 'scope' });

  function startEditing(flag: FeatureFlag): void {
    setEditingFlagId(flag.id);
    reset({
      key: flag.key,
      scope: flag.scope,
      tenantId: flag.tenantId ?? '',
      isEnabled: flag.isEnabled,
      description: flag.description ?? '',
    });
  }

  function startCreating(): void {
    setEditingFlagId(null);
    reset(EMPTY_FORM);
  }

  const upsertMutation = useMutation({
    mutationFn: (input: UpsertFeatureFlagInput) => upsertFeatureFlag(input),
    onSuccess: () => {
      toast.success(editingFlagId ? 'Flag updated.' : 'Flag created.');
      // Every filtered view (any `tenantId` variant) can be affected by
      // one write, so this prefix-invalidates all of them rather than
      // guessing which one — see query-keys.ts's own comment.
      void queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      startCreating();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not save this flag.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (flagId: string) => deleteFeatureFlag(flagId),
    onSuccess: (_data, flagId) => {
      toast.success('Flag deleted.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      if (editingFlagId === flagId) startCreating();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not delete this flag.');
    },
  });

  function onSubmit(values: FeatureFlagFormValues): void {
    const input: UpsertFeatureFlagInput = {
      key: values.key,
      scope: values.scope,
      isEnabled: values.isEnabled,
      ...(values.scope === 'TENANT' ? { tenantId: values.tenantId.trim() } : {}),
      ...(values.description.trim() ? { description: values.description.trim() } : {}),
    };
    upsertMutation.mutate(input);
  }

  const flags = flagsQuery.data?.flags ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <div>
        <h1 className="font-display text-foreground text-2xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-1">
          Global and per-tenant flags. A tenant-scoped row overrides a global flag of the same key
          for that one tenant.
        </p>
      </div>

      <div className="mt-6 max-w-sm">
        <Field
          label="Filter by tenant ID"
          htmlFor="flag-tenant-filter"
          hint="Leave blank to see only global flags."
        >
          {({ id }) => (
            <Input
              id={id}
              value={tenantFilter}
              onChange={(event) => {
                setTenantFilter(event.target.value);
              }}
              placeholder="Tenant UUID…"
            />
          )}
        </Field>
      </div>

      <div className="mt-6 space-y-3">
        {flagsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : flagsQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load feature flags. Please try again.
          </p>
        ) : flags.length > 0 ? (
          flags.map((flag) => (
            <div
              key={flag.id}
              className="border-border bg-card flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-foreground truncate text-sm font-semibold">{flag.key}</p>
                  <Badge variant={flag.isEnabled ? 'success' : 'neutral'}>
                    {flag.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge variant="neutral">
                    {flag.scope === 'GLOBAL' ? 'Global' : `Tenant: ${flag.tenantId ?? ''}`}
                  </Badge>
                </div>
                {flag.description ? (
                  <p className="text-muted-foreground mt-1 truncate text-xs">{flag.description}</p>
                ) : null}
              </div>
              {canManage ? (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Edit flag"
                    onClick={() => {
                      startEditing(flag);
                    }}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete flag"
                    onClick={() => {
                      deleteMutation.mutate(flag.id);
                    }}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive inline-flex h-8 w-8 items-center justify-center rounded-md"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              {trimmedFilter ? 'No feature flags match this filter.' : 'No feature flags yet.'}
            </p>
          </div>
        )}
      </div>

      {canManage ? (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{editingFlagId ? 'Edit flag' : 'New flag'}</CardTitle>
                <CardDescription>
                  {editingFlagId
                    ? 'Key and scope are fixed once editing — delete and recreate to change them.'
                    : 'A true upsert — an existing (key, scope, tenant) combination is updated, not duplicated.'}
                </CardDescription>
              </div>
              {editingFlagId ? (
                <Button type="button" variant="ghost" size="sm" onClick={startCreating}>
                  <X aria-hidden="true" className="h-4 w-4" />
                  New flag
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                void handleSubmit(onSubmit)(event);
              }}
              noValidate
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Key" htmlFor="flag-key" required {...fieldError(errors.key?.message)}>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      placeholder="ai_flow_generation"
                      disabled={editingFlagId !== null}
                      {...register('key')}
                    />
                  )}
                </Field>
                <Field label="Scope" htmlFor="flag-scope" required>
                  {({ id }) => (
                    <Select id={id} disabled={editingFlagId !== null} {...register('scope')}>
                      {FEATURE_FLAG_SCOPE_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {value === 'GLOBAL' ? 'Global' : 'Tenant'}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>

              {scope === 'TENANT' ? (
                <Field
                  label="Tenant ID"
                  htmlFor="flag-tenant-id"
                  required
                  {...fieldError(errors.tenantId?.message)}
                >
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      disabled={editingFlagId !== null}
                      {...register('tenantId')}
                    />
                  )}
                </Field>
              ) : null}

              <Field
                label="Description"
                htmlFor="flag-description"
                hint="Optional."
                {...fieldError(errors.description?.message)}
              >
                {({ id, describedBy, invalid }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    {...register('description')}
                  />
                )}
              </Field>

              <label className="text-foreground flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="border-input text-brand focus:ring-ring h-4 w-4 rounded focus:ring-2"
                  {...register('isEnabled')}
                />
                Enabled
              </label>

              <Button type="submit" isLoading={upsertMutation.isPending}>
                {editingFlagId ? 'Save changes' : 'Create flag'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
