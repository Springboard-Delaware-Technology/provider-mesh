/**
 * `AuditSink` port (Foundation 001 §4.4, §5.5): append an event, read the chain head, export a
 * checkpoint. The input carries the content columns of `audit_event`, one per `SEC-AUD-02`
 * field; the integrity columns (`sequence`, `prev_hash`, `hash`) and the trusted recording time
 * (`recorded_at`) are assigned by the store's chain trigger and cannot be supplied by a writer.
 *
 * Every nullable field is a `Maybe<T>`: a value, or an `Absent` marker carrying the reason the
 * value is absent (§5.5: "every nullable field distinguishes unknown from not applicable"). The
 * store keeps the reason in a paired `<column>_absent` column, so a caller cannot record an
 * absence without saying which kind it is (`SEC-AUD-02`: "unavailable values explicitly
 * distinguished from known values").
 */
export type AuditResult = 'attempted' | 'completed' | 'failed' | 'unknown';

export type AuditActorKind = 'human' | 'service' | 'system' | 'unknown';

/** Why a nullable field carries no value: the Mesh does not know it, or it does not apply. */
export type AbsenceReason = 'unknown' | 'not_applicable';

export interface Absent {
  readonly absent: AbsenceReason;
}

export type Maybe<T> = T | Absent;

export interface AuditEventInput {
  /** Opaque UUID supplied by the writer (Domain Model §4.1); the store does not generate it. */
  readonly eventId: string;
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly correlationId: string;
  readonly causationId: Maybe<string>;

  readonly actorId: Maybe<string>;
  readonly actorKind: AuditActorKind;
  readonly delegatingActorId: Maybe<string>;
  readonly representedOrgId: Maybe<string>;
  readonly representedUnitId: Maybe<string>;
  readonly representedCapacity: Maybe<string>;

  /** When the action occurred, as an ISO 8601 instant; `recorded_at` is set by the server. */
  readonly occurredAt: string;
  readonly externalTime: Maybe<string>;
  /** A Domain Model §4.4 term, or a clock-anomaly code, where material. */
  readonly timeUncertainty: Maybe<string>;

  readonly operation: string;
  readonly targetType: Maybe<string>;
  readonly targetId: Maybe<string>;
  readonly targetVersion: Maybe<string>;
  readonly subjectScope: Maybe<string>;
  readonly destinationRef: Maybe<string>;

  readonly authorizationDecisionId: Maybe<string>;
  /** One or more references when known; never an empty list (an absence carries its reason). */
  readonly authorityRefs: Maybe<readonly string[]>;
  readonly policyVersion: Maybe<string>;
  readonly purpose: Maybe<string>;

  readonly result: AuditResult;
  readonly reasonCode: Maybe<string>;
  readonly beforeVersion: Maybe<string>;
  readonly afterVersion: Maybe<string>;
  readonly externalReceipt: Maybe<string>;

  readonly reviewRef: Maybe<string>;
  readonly originChannel: string;
  readonly retentionClass: string;
}

export interface ChainHead {
  /** 1-based position in the chain; `0` with the genesis hash describes an empty chain. */
  readonly sequence: number;
  /** Hex SHA-256 assigned by the chain trigger. */
  readonly hash: string;
}

export interface AuditCheckpoint extends ChainHead {
  /** When `verifierIdentity` observed this head, as an ISO 8601 instant. */
  readonly verifiedAt: string;
  readonly verifierIdentity: string;
}

export interface AuditSink {
  /** Appends one event and returns the chain position the store assigned to it. */
  append(event: AuditEventInput): Promise<ChainHead>;
  /** `null` when the chain is empty. */
  chainHead(): Promise<ChainHead | null>;
  /**
   * Exports a checkpoint of the current head through the object-store port and records the
   * export as an audit event; returns the checkpoint written (§5.5 rule 4).
   */
  exportCheckpoint(verifierIdentity: string): Promise<AuditCheckpoint>;
}
