import { apiFetch } from '@/lib/api/client';
import type { Entity, EntityRelationship, EntityRelationships } from '@/types/entity';
import type { EntityType, EntityRelationshipType } from '@/types/enums';

export interface ListEntitiesParams {
  type?: EntityType;
  limit?: number;
  cursor?: string;
}

/** `GET /entities`'s response shape — keyset pagination, no total count (Section 4). */
export interface ListEntitiesResult {
  entities: Entity[];
  nextCursor: string | null;
}

/**
 * Milestone 4 built the read path (`listEntities`); Milestone 5 adds
 * the write operations here per that milestone's own note — same file,
 * not a new one.
 */
export async function listEntities(params: ListEntitiesParams = {}): Promise<ListEntitiesResult> {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const queryString = query.toString();

  return apiFetch<ListEntitiesResult>(`/v1/entities${queryString ? `?${queryString}` : ''}`);
}

export async function getEntity(entityId: string): Promise<Entity> {
  return apiFetch<Entity>(`/v1/entities/${entityId}`);
}

export interface CreateEntityInput {
  type: EntityType;
  displayName: string;
  attributes?: Record<string, unknown>;
}

export async function createEntity(input: CreateEntityInput): Promise<Entity> {
  return apiFetch<Entity>('/v1/entities', { method: 'POST', body: input });
}

export async function getEntityRelationships(entityId: string): Promise<EntityRelationships> {
  return apiFetch<EntityRelationships>(`/v1/entities/${entityId}/relationships`);
}

/**
 * Direction convention (see types/entity.ts's own comment):
 * `parentEntityId` is the URL segment. Easy to get backwards — a
 * caller saying "entity A is a `relationshipType` of entity B" wants
 * `createEntityRelationship(B, { childEntityId: A, relationshipType })`,
 * not the other way around.
 */
export async function createEntityRelationship(
  parentEntityId: string,
  input: { childEntityId: string; relationshipType: EntityRelationshipType },
): Promise<EntityRelationship> {
  return apiFetch<EntityRelationship>(`/v1/entities/${parentEntityId}/relationships`, {
    method: 'POST',
    body: input,
  });
}
