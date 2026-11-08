'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { createEntity } from '@/lib/api/entities';
import { ENTITY_TYPE_VALUES } from '@/types/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fieldError } from '@/lib/utils';

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface CreateEntityFormValues {
  type: 'PERSON' | 'ACCOUNT';
  displayName: string;
  attributes: { key: string; value: string }[];
}

const createEntityFormSchema = z.object({
  type: z.enum(ENTITY_TYPE_VALUES),
  displayName: z.string().min(1, 'Enter a name').max(300, 'At most 300 characters'),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })),
});

/** Drops rows with an empty key and folds the {key, value} pairs into the Record<string, unknown> the API expects. */
function attributesToRecord(attributes: { key: string; value: string }[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const { key, value } of attributes) {
    if (key.trim()) record[key.trim()] = value;
  }
  return record;
}

export function CreateEntityForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateEntityFormValues>({
    resolver: zodResolver(createEntityFormSchema),
    defaultValues: { type: 'PERSON', displayName: '', attributes: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });

  const createMutation = useMutation({
    mutationFn: createEntity,
    onSuccess: (entity) => {
      toast.success('Entity created.');
      router.push(`/entities/${entity.id}`);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not create this entity.');
    },
  });

  async function onSubmit(data: CreateEntityFormValues): Promise<void> {
    await createMutation.mutateAsync({
      type: data.type,
      displayName: data.displayName,
      attributes: attributesToRecord(data.attributes),
    });
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>New entity</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          noValidate
          className="space-y-5"
        >
          <Field label="Type" htmlFor="entity-type" required>
            {({ id, describedBy, invalid }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('type')}
              >
                <option value="PERSON">Person</option>
                <option value="ACCOUNT">Account</option>
              </Select>
            )}
          </Field>

          <Field
            label="Name"
            htmlFor="entity-name"
            required
            {...fieldError(errors.displayName?.message)}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...register('displayName')}
              />
            )}
          </Field>

          <div>
            <p className="text-foreground text-sm font-medium">Attributes</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Optional custom fields — anything worth recording.
            </p>
            <div className="mt-3 space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- react-hook-form's Path<T> specifically needs the numeric template pattern `attributes.${number}.key` here; String(index) satisfies this rule but produces `attributes.${string}.key`, which fails typecheck against react-hook-form's own generated path union. A number always interpolates safely (no [object Object]-style risk), so this is a genuine conflict between two type tools, not a suppressed unsafe pattern. */}
                  <Input placeholder="Key" {...register(`attributes.${index}.key` as const)} />
                  {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- see comment above */}
                  <Input placeholder="Value" {...register(`attributes.${index}.value` as const)} />
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                    aria-label="Remove attribute"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                append({ key: '', value: '' });
              }}
              className="text-brand mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Add attribute
            </button>
          </div>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
            Create entity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
