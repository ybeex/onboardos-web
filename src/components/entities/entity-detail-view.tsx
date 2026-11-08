'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  getEntity,
  getEntityRelationships,
  createEntityRelationship,
  listEntities,
} from '@/lib/api/entities';
import { entityDetailQueryKey, entityRelationshipsQueryKey } from '@/lib/entities/query-keys';
import { EntityTypeBadge } from '@/components/entities/entity-type-badge';
import { StartEnrollmentForm } from '@/components/enrollments/start-enrollment-form';
import { ENTITY_RELATIONSHIP_TYPE_VALUES } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldError } from '@/lib/utils';

export interface EntityDetailViewProps {
  entityId: string;
}

const ENTITY_QUERY_KEY = entityDetailQueryKey;
const RELATIONSHIPS_QUERY_KEY = entityRelationshipsQueryKey;

/** Hand-written interface, not `z.infer<>` — see README.md "Type conventions". */
interface AddRelationshipFormValues {
  direction: 'as-child' | 'as-parent';
  otherEntityId: string;
  relationshipType: 'STAKEHOLDER_OF' | 'EMPLOYEE_OF' | 'OWNS';
}

const addRelationshipFormSchema = z.object({
  direction: z.enum(['as-child', 'as-parent']),
  otherEntityId: z.string().min(1, 'Pick an entity'),
  relationshipType: z.enum(ENTITY_RELATIONSHIP_TYPE_VALUES),
});

/**
 * No entity-search endpoint exists (checked Section 4 — the only
 * lookup is the paginated list), so this picker is a plain select
 * populated from the first 100 entities rather than a real type-ahead
 * search. A reasonable MVP limit for M5, not a hidden gap: flagged
 * here and in BUILD_PLAN.md's M5 section.
 */
function useEntityPickerOptions(excludeEntityId: string) {
  const query = useQuery({
    queryKey: ['entities', 'picker'],
    queryFn: () => listEntities({ limit: 100 }),
  });
  return (query.data?.entities ?? []).filter((entity) => entity.id !== excludeEntityId);
}

function AddRelationshipForm({ entityId, onDone }: { entityId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const pickerOptions = useEntityPickerOptions(entityId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddRelationshipFormValues>({
    resolver: zodResolver(addRelationshipFormSchema),
    defaultValues: { direction: 'as-child', otherEntityId: '', relationshipType: 'STAKEHOLDER_OF' },
  });

  const createMutation = useMutation({
    mutationFn: (values: AddRelationshipFormValues) => {
      // Direction convention (see types/entity.ts): the URL's entityId
      // is always the PARENT. "as-child" means the entity this page is
      // showing is the child, so the OTHER entity goes in the URL.
      const parentEntityId = values.direction === 'as-child' ? values.otherEntityId : entityId;
      const childEntityId = values.direction === 'as-child' ? entityId : values.otherEntityId;
      return createEntityRelationship(parentEntityId, {
        childEntityId,
        relationshipType: values.relationshipType,
      });
    },
    onSuccess: () => {
      toast.success('Relationship added.');
      void queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY(entityId) });
      onDone();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Could not add this relationship.');
    },
  });

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit((values) => createMutation.mutateAsync(values))(event);
      }}
      noValidate
      className="border-border bg-muted/40 mt-4 space-y-4 rounded-lg border p-4"
    >
      <Field label="This entity is the" htmlFor="rel-direction">
        {({ id }) => (
          <Select id={id} {...register('direction')}>
            <option value="as-child">Child</option>
            <option value="as-parent">Parent</option>
          </Select>
        )}
      </Field>
      <Field label="Relationship type" htmlFor="rel-type">
        {({ id }) => (
          <Select id={id} {...register('relationshipType')}>
            <option value="STAKEHOLDER_OF">Stakeholder of</option>
            <option value="EMPLOYEE_OF">Employee of</option>
            <option value="OWNS">Owns</option>
          </Select>
        )}
      </Field>
      <Field
        label="Other entity"
        htmlFor="rel-other"
        required
        {...fieldError(errors.otherEntityId?.message)}
      >
        {({ id, describedBy, invalid }) => (
          <Select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...register('otherEntityId')}
          >
            <option value="">Select an entity…</option>
            {pickerOptions.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.displayName}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Add relationship
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function EntityDetailView({ entityId }: EntityDetailViewProps) {
  const [addingRelationship, setAddingRelationship] = useState(false);
  const [startingEnrollment, setStartingEnrollment] = useState(false);

  const entityQuery = useQuery({
    queryKey: ENTITY_QUERY_KEY(entityId),
    queryFn: () => getEntity(entityId),
  });
  const relationshipsQuery = useQuery({
    queryKey: RELATIONSHIPS_QUERY_KEY(entityId),
    queryFn: () => getEntityRelationships(entityId),
  });

  if (entityQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-10 sm:px-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (entityQuery.isError || !entityQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Couldn&rsquo;t load this entity.</p>
      </div>
    );
  }

  const entity = entityQuery.data;
  const attributeEntries = Object.entries(entity.attributes);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-foreground text-2xl font-bold">{entity.displayName}</h1>
        <EntityTypeBadge type={entity.type} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Attributes
        </h2>
        {attributeEntries.length === 0 ? (
          <p className="text-muted-foreground mt-3 text-sm">No attributes recorded.</p>
        ) : (
          <dl className="divide-border border-border bg-card mt-3 divide-y rounded-lg border">
            {attributeEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">{key}</dt>
                <dd className="text-foreground text-right">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Enrollments
          </h2>
          {!startingEnrollment ? (
            <button
              type="button"
              onClick={() => {
                setStartingEnrollment(true);
              }}
              className="text-brand inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Start enrollment
            </button>
          ) : null}
        </div>
        {startingEnrollment ? (
          <StartEnrollmentForm
            entityId={entityId}
            onDone={() => {
              setStartingEnrollment(false);
            }}
          />
        ) : (
          <p className="text-muted-foreground mt-3 text-sm">
            There&rsquo;s no list of this entity&rsquo;s past enrollments yet — view a flow&rsquo;s
            enrollments from its own page instead.
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Relationships
          </h2>
          {!addingRelationship ? (
            <button
              type="button"
              onClick={() => {
                setAddingRelationship(true);
              }}
              className="text-brand inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Add
            </button>
          ) : null}
        </div>

        {addingRelationship ? (
          <AddRelationshipForm
            entityId={entityId}
            onDone={() => {
              setAddingRelationship(false);
            }}
          />
        ) : null}

        {relationshipsQuery.isLoading ? (
          <Skeleton className="mt-3 h-20 w-full" />
        ) : relationshipsQuery.data ? (
          <div className="mt-3 space-y-2">
            {relationshipsQuery.data.asChild.length === 0 &&
            relationshipsQuery.data.asParent.length === 0 ? (
              <p className="text-muted-foreground text-sm">No relationships recorded.</p>
            ) : (
              <>
                {relationshipsQuery.data.asChild.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="border-border bg-card rounded-lg border px-4 py-3 text-sm"
                  >
                    <span className="text-foreground">{relationship.relationshipType}</span>{' '}
                    <Link
                      href={`/entities/${relationship.parentEntityId}`}
                      className="text-brand hover:underline"
                    >
                      view entity
                    </Link>
                  </div>
                ))}
                {relationshipsQuery.data.asParent.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="border-border bg-card rounded-lg border px-4 py-3 text-sm"
                  >
                    <Link
                      href={`/entities/${relationship.childEntityId}`}
                      className="text-brand hover:underline"
                    >
                      view entity
                    </Link>{' '}
                    <span className="text-foreground">
                      is a {relationship.relationshipType} of this entity
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
