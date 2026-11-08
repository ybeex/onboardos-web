import type { EntityType, EntityRelationshipType } from '@/types/enums';

/**
 * Hand-written, not `z.infer<>` — see README.md "Type conventions".
 * `id`/`createdAt`/`updatedAt` on Entity, and `id`/`createdAt` on
 * EntityRelationship, aren't individually spelled out in BUILD_PLAN.md
 * Section 4's terse endpoint descriptions — they're the standard
 * fields effectively every REST resource in this backend has, not a
 * confirmed-verbatim contract. Everything else here (`type`,
 * `displayName`, `attributes`, the relationship fields, the
 * parent/child direction convention) is directly evidenced by Section
 * 4's own text.
 */

export interface Entity {
  id: string;
  type: EntityType;
  displayName: string;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Direction convention (Section 4, Entities): the row means
 * "childEntityId `<relationshipType>` parentEntityId" — e.g. a
 * `STAKEHOLDER_OF` row with childEntityId=Alice, parentEntityId=Acme
 * Corp reads "Alice is a stakeholder of Acme Corp." The URL's
 * `:entityId` in `POST /entities/:entityId/relationships` is the
 * PARENT, not the child — easy to get backwards.
 */
export interface EntityRelationship {
  id: string;
  parentEntityId: string;
  childEntityId: string;
  relationshipType: EntityRelationshipType;
  createdAt: string;
}

/** `GET /entities/:entityId/relationships`'s response shape. */
export interface EntityRelationships {
  asParent: EntityRelationship[];
  asChild: EntityRelationship[];
}
