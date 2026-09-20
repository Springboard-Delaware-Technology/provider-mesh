import type { SqlStatement, TransactionScope } from '../../platform/ports/index.js';

import {
  CANONICAL_TIMESTAMP,
  HASHED_COLUMNS,
  isHex64,
  type AuditEventRow,
  type HashedColumns,
} from './canonical.js';

/**
 * Reads `audit_event` rows in chain order, in the canonical text forms the hash covers
 * (§5.5 rule 3). Timestamps are rendered by the server in the canonical form documented in
 * the migration, because the SQL client would otherwise parse them into millisecond dates;
 * `sequence` is read as text and held as a bigint; the domain array is cast to `text[]` so the
 * client parses it. Nothing here needs more than SELECT on `audit_event`.
 */
export const CANONICAL_TIMESTAMP_SQL = (column: string): string =>
  `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS ${column}`;

function selectExpression(column: keyof HashedColumns): string {
  switch (column) {
    case 'occurred_at':
    case 'recorded_at':
    case 'external_time':
      return CANONICAL_TIMESTAMP_SQL(column);
    case 'authority_refs':
      return 'authority_refs::text[] AS authority_refs';
    case 'sequence':
      return 'sequence::text AS sequence';
    case 'schema_version':
      return 'schema_version';
    default:
      return `${column}::text AS ${column}`;
  }
}

export const CHAIN_ROW_COLUMNS = `${HASHED_COLUMNS.map(selectExpression).join(', ')}, hash`;

/** Rows with `sequence` greater than `after`, ascending, at most `limit` (keyset pagination). */
export function chainRowsStatement(after: bigint, limit: number): SqlStatement {
  return {
    text: `SELECT ${CHAIN_ROW_COLUMNS} FROM audit_event WHERE sequence > $1 ORDER BY sequence LIMIT $2`,
    values: [after.toString(), limit],
  };
}

export class ChainRowError extends Error {
  readonly column: string;
  constructor(column: string, problem: string) {
    super(`audit chain row: ${column} ${problem}`);
    this.name = 'ChainRowError';
    this.column = column;
  }
}

const TEXT_OR_NULL = new Set<keyof HashedColumns>(HASHED_COLUMNS);
TEXT_OR_NULL.delete('sequence');
TEXT_OR_NULL.delete('schema_version');
TEXT_OR_NULL.delete('authority_refs');

/** Validates the shapes the query promises; a row that breaks them is reported, never hashed. */
export function parseChainRow(raw: Readonly<Record<string, unknown>>): AuditEventRow {
  const out: Record<string, unknown> = {};
  for (const column of HASHED_COLUMNS) {
    const value = raw[column];
    if (column === 'sequence') {
      if (typeof value !== 'string' || !/^\d{1,18}$/.test(value)) {
        throw new ChainRowError(column, 'is not a sequence number');
      }
      out[column] = BigInt(value);
    } else if (column === 'schema_version') {
      if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
        throw new ChainRowError(column, 'is not an integer');
      }
      out[column] = value;
    } else if (column === 'authority_refs') {
      if (value !== null && (!Array.isArray(value) || value.some((v) => typeof v !== 'string'))) {
        throw new ChainRowError(column, 'is not a list of text');
      }
      out[column] = value === null ? null : [...(value as string[])];
    } else if (TEXT_OR_NULL.has(column)) {
      if (value !== null && typeof value !== 'string')
        throw new ChainRowError(column, 'is not text');
      if (
        typeof value === 'string' &&
        (column === 'occurred_at' || column === 'recorded_at' || column === 'external_time') &&
        !CANONICAL_TIMESTAMP.test(value)
      ) {
        throw new ChainRowError(column, 'is not a canonical timestamp');
      }
      out[column] = value;
    }
  }
  const hash = raw['hash'];
  if (typeof hash !== 'string' || !isHex64(hash)) throw new ChainRowError('hash', 'is not hex');
  if (typeof out['prev_hash'] !== 'string' || !isHex64(out['prev_hash'])) {
    throw new ChainRowError('prev_hash', 'is not hex');
  }
  out['hash'] = hash;
  return out as unknown as AuditEventRow;
}

export async function readChainRows(
  scope: TransactionScope,
  after: bigint,
  limit: number,
): Promise<readonly AuditEventRow[]> {
  const result = await scope.query<Record<string, unknown>>(chainRowsStatement(after, limit));
  return result.rows.map(parseChainRow);
}

export interface HeadRow {
  readonly sequence: number;
  readonly hash: string;
  readonly eventId: string;
}

/** The chain head through the `audit_chain_head` view (§5.2), or `null` for an empty chain. */
export async function readChainHead(scope: TransactionScope): Promise<HeadRow | null> {
  const result = await scope.query<{ sequence: string; hash: string; event_id: string }>({
    text: 'SELECT sequence::text AS sequence, hash, event_id::text AS event_id FROM audit_chain_head',
  });
  const row = result.rows[0];
  if (row === undefined) return null;
  const sequence = Number(row.sequence);
  if (!Number.isSafeInteger(sequence) || sequence < 1 || !isHex64(row.hash)) {
    throw new ChainRowError('head', 'is malformed');
  }
  return { sequence, hash: row.hash, eventId: row.event_id };
}
