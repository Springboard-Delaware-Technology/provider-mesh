import type { Absent, AbsenceReason, Maybe } from '../../platform/ports/index.js';

/** The two absence markers a writer may record for a nullable field (§5.5). */
export const UNKNOWN: Absent = { absent: 'unknown' };
export const NOT_APPLICABLE: Absent = { absent: 'not_applicable' };

export function absent(reason: AbsenceReason): Absent {
  return reason === 'unknown' ? UNKNOWN : NOT_APPLICABLE;
}

export function isAbsent(value: unknown): value is Absent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'absent' in value &&
    ((value as Absent).absent === 'unknown' || (value as Absent).absent === 'not_applicable')
  );
}

/** The value, or `null` with the reason, as the paired columns store it. */
export function split<T>(value: Maybe<T>): {
  readonly value: T | null;
  readonly absent: AbsenceReason | null;
} {
  return isAbsent(value) ? { value: null, absent: value.absent } : { value, absent: null };
}
