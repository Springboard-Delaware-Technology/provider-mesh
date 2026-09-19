/**
 * Validated actor context (Foundation 001 §5.6 rule 2).
 *
 * The compartment session context written by `RelationalStore` at transaction start is derived
 * from this object and from nothing else. No HTTP handler, header, query parameter, or body value
 * may construct one directly; under Foundation 001 the only producer is the test stub in
 * `src/modules/authority` (§1.5 excludes the authorization engine).
 */
export interface ActorContext {
  /** Opaque actor identifier (Domain Model §4.1). */
  readonly actorId: string;
  /** Mesh Person IDs the actor may act for → `mesh.person_ids`. */
  readonly personIds: readonly string[];
  /** Organization IDs the actor represents → `mesh.org_ids`. */
  readonly orgIds: readonly string[];
  /** Collaboration IDs the actor participates in → `mesh.collab_ids`. */
  readonly collabIds: readonly string[];
  /** Purpose code of the current activity → `mesh.purpose`. */
  readonly purpose: string;
  /** Capacity in which the actor acts, or null when none applies → `mesh.capacity`. */
  readonly capacity: string | null;
}
