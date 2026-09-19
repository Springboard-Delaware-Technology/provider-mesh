/**
 * `AuditSink` port (Foundation 001 §4.4, §5.5): append an event, read the chain head, export a
 * checkpoint. Column shapes follow the SEC-AUD-02 field groups; the chain fields (`sequence`,
 * `prev_hash`, `hash`) are assigned by the store and cannot be supplied by a writer.
 */
export type AuditResult = 'attempted' | 'completed' | 'failed' | 'unknown';

export interface AuditEventInput {
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly correlationId: string;
  readonly causationId: string | null;

  readonly actorId: string | null;
  readonly actorKind: string;
  readonly delegatingActorId: string | null;
  readonly representedOrgId: string | null;
  readonly representedUnitId: string | null;
  readonly representedCapacity: string | null;

  readonly occurredAt: string;
  readonly externalTime: string | null;
  readonly timeUncertainty: string | null;

  readonly operation: string;
  readonly targetType: string | null;
  readonly targetId: string | null;
  readonly targetVersion: string | null;
  readonly subjectScope: string | null;
  readonly destinationRef: string | null;

  readonly authorizationDecisionId: string | null;
  readonly authorityRefs: readonly string[];
  readonly policyVersion: string | null;
  readonly purpose: string | null;

  readonly result: AuditResult;
  readonly reasonCode: string | null;
  readonly beforeVersion: string | null;
  readonly afterVersion: string | null;
  readonly externalReceipt: string | null;

  readonly reviewRef: string | null;
  readonly originChannel: string;
  readonly retentionClass: string;
}

export interface ChainHead {
  readonly sequence: number;
  readonly hash: string;
}

export interface AuditCheckpoint extends ChainHead {
  readonly verifiedAt: string;
  readonly verifierIdentity: string;
}

export interface AuditSink {
  append(event: AuditEventInput): Promise<ChainHead>;
  /** `null` when the chain is empty. */
  chainHead(): Promise<ChainHead | null>;
  /** Exports a checkpoint through the object-store port; returns the checkpoint written. */
  exportCheckpoint(verifierIdentity: string): Promise<AuditCheckpoint>;
}
