'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus, User2 } from 'lucide-react';
import { listEntities } from '@/lib/api/entities';
import { EntityTypeBadge } from '@/components/entities/entity-type-badge';
import { Select } from '@/components/ui/select';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { EntityType } from '@/types/enums';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function EntitiesPage() {
  const [type, setType] = useState<EntityType | ''>('');

  const entitiesQuery = useInfiniteQuery({
    queryKey: ['entities', 'list', type],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listEntities({
        ...(type ? { type } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
        limit: PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const entities = entitiesQuery.data?.pages.flatMap((page) => page.entities) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-2xl font-bold">Entities</h1>
          <p className="text-muted-foreground mt-1">
            The people and accounts moving through your flows.
          </p>
        </div>
        <Link
          href="/entities/new"
          className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New entity
        </Link>
      </div>

      <div className="mt-6">
        <Select
          value={type}
          onChange={(event) => {
            setType(event.target.value as EntityType | '');
          }}
          className="w-auto"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="PERSON">People</option>
          <option value="ACCOUNT">Accounts</option>
        </Select>
      </div>

      <div className="mt-6 space-y-3">
        {entitiesQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))
        ) : entitiesQuery.isError ? (
          <p className="border-border bg-card text-destructive rounded-lg border p-6 text-sm">
            Couldn&rsquo;t load entities. Please try again.
          </p>
        ) : entities.length > 0 ? (
          entities.map((entity) => (
            <Link
              key={entity.id}
              href={`/entities/${entity.id}`}
              className="border-border bg-card shadow-soft-sm ease-soft hover:shadow-soft-md flex items-center justify-between gap-4 rounded-lg border p-5 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-accent text-accent-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                  <User2 aria-hidden="true" className="h-5 w-5" />
                </span>
                <p className="font-display text-foreground truncate text-sm font-semibold">
                  {entity.displayName}
                </p>
              </div>
              <EntityTypeBadge type={entity.type} />
            </Link>
          ))
        ) : (
          <div className="border-border rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground text-sm">
              {type
                ? 'No entities match this filter.'
                : 'No entities yet — add one to get started.'}
            </p>
          </div>
        )}
      </div>

      {entitiesQuery.hasNextPage ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            isLoading={entitiesQuery.isFetchingNextPage}
            onClick={() => {
              void entitiesQuery.fetchNextPage();
            }}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
