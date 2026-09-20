import type { ObjectStore } from '../../platform/ports/index.js';

import { GENESIS_HASH, isHex64 } from './canonical.js';

/**
 * Integrity checkpoints (§5.5 rule 4; `SEC-AUD-04`): head sequence, head hash, verified-at,
 * verifier identity, bound to the instance whose chain they describe. Written through the
 * `ObjectStore` port under two keys — a dated, never-overwritten record and `latest.json` —
 * so `audit:verify` can find the newest one without a listing operation the port does not
 * offer. The file is canonical JSON (sorted keys, no whitespace), so its SHA-256 recorded by the
 * object store, and in the audit event as `external_receipt`, is reproducible.
 */
export const CHECKPOINT_VERSION = 1;

export interface CheckpointRecord {
  readonly version: typeof CHECKPOINT_VERSION;
  readonly instanceId: string;
  readonly environment: string;
  /** `0` with the genesis hash describes an empty chain. */
  readonly sequence: number;
  readonly hash: string;
  readonly verifiedAt: string;
  readonly verifierIdentity: string;
}

export class CheckpointError extends Error {
  readonly code: 'malformed' | 'foreign_instance';
  constructor(code: CheckpointError['code'], detail: string) {
    super(`audit checkpoint: ${code} (${detail})`);
    this.name = 'CheckpointError';
    this.code = code;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function checkpointPrefix(instanceId: string): string {
  if (!UUID.test(instanceId)) throw new CheckpointError('malformed', 'instance id');
  return `audit-checkpoints/${instanceId}`;
}

export function latestCheckpointKey(instanceId: string): string {
  return `${checkpointPrefix(instanceId)}/latest.json`;
}

export function datedCheckpointKey(
  instanceId: string,
  verifiedAt: string,
  sequence: number,
): string {
  const stamp = verifiedAt.replace(/[-:]/g, '').replace('.', '');
  return `${checkpointPrefix(instanceId)}/${stamp}-${String(sequence).padStart(12, '0')}.json`;
}

export function serializeCheckpoint(record: CheckpointRecord): Uint8Array {
  const ordered = Object.fromEntries(
    Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  return new TextEncoder().encode(JSON.stringify(ordered));
}

export function parseCheckpoint(bytes: Uint8Array, instanceId: string): CheckpointRecord {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new CheckpointError('malformed', 'not JSON');
  }
  if (typeof parsed !== 'object' || parsed === null)
    throw new CheckpointError('malformed', 'shape');
  const r = parsed as Record<string, unknown>;
  const ok =
    r['version'] === CHECKPOINT_VERSION &&
    typeof r['instanceId'] === 'string' &&
    typeof r['environment'] === 'string' &&
    typeof r['sequence'] === 'number' &&
    Number.isSafeInteger(r['sequence']) &&
    r['sequence'] >= 0 &&
    typeof r['hash'] === 'string' &&
    isHex64(r['hash']) &&
    typeof r['verifiedAt'] === 'string' &&
    !Number.isNaN(Date.parse(r['verifiedAt'])) &&
    typeof r['verifierIdentity'] === 'string';
  if (!ok) throw new CheckpointError('malformed', 'field');
  const record = r as unknown as CheckpointRecord;
  if (record.instanceId !== instanceId)
    throw new CheckpointError('foreign_instance', 'instance id');
  if (record.sequence === 0 && record.hash !== GENESIS_HASH) {
    throw new CheckpointError('malformed', 'sequence 0 must carry the genesis hash');
  }
  return record;
}

/** The newest checkpoint for the instance, or `null` when none was ever exported. */
export async function readLatestCheckpoint(
  objects: ObjectStore,
  instanceId: string,
): Promise<CheckpointRecord | null> {
  const stored = await objects.get(latestCheckpointKey(instanceId));
  if (stored === null) return null;
  return parseCheckpoint(stored.bytes, instanceId);
}
