/**
 * Compartment references (ADR-001 §5.1; Foundation 001 §5.6).
 *
 * Every protected-class row, event, and job carries the subset of these that applies to it.
 * `null` means "not applicable"; a reference is never inferred.
 */
export interface CompartmentRefs {
  readonly subjectPersonId: string | null;
  readonly purposeCode: string;
  readonly responsibleOrgId: string | null;
  readonly responsibleCapacity: string | null;
  /** Set only where different from the responsible Organization. */
  readonly contributingOrgId: string | null;
  readonly collaborationId: string | null;
  /** Required whenever `collaborationId` is set. */
  readonly charterVersionId: string | null;
  /** Springboard's distinct platform, service-delivery, or backbone capacity, when it applies. */
  readonly springboardCapacity: string | null;
}
