/**
 * Originally defined only inside entity-detail-view.tsx (M5);
 * consolidated here now that the Milestone 8 enrollment detail view
 * needs the exact same cache entry for an entity's display name — same
 * reasoning as `@/lib/flows/query-keys`'s `flowDetailQueryKey`.
 */
export const entityDetailQueryKey = (entityId: string) => ['entities', 'detail', entityId] as const;

export const entityRelationshipsQueryKey = (entityId: string) =>
  ['entities', 'relationships', entityId] as const;
