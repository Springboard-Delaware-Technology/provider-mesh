import type { ActorContext, SqlStatement } from '../../ports/index.js';

/**
 * Compartment session context (Foundation 001 §5.6 rule 2).
 *
 * Six transaction-local settings are written at transaction start from a validated
 * `ActorContext`, and from nothing else. `set_config(..., true)` scopes each value to the
 * transaction, so a pooled connection carries nothing into its next transaction. A `null`
 * context writes every setting as empty, so a transaction without context sees no protected
 * rows under the policies of C6 (§5.6 rule 3).
 *
 * Lists are serialized comma-separated. Identifiers are validated to a character set that
 * excludes the comma, so the policies can split with `string_to_array(..., ',')` safely.
 */
export const SESSION_SETTINGS = {
  actorId: 'mesh.actor_id',
  personIds: 'mesh.person_ids',
  orgIds: 'mesh.org_ids',
  collabIds: 'mesh.collab_ids',
  purpose: 'mesh.purpose',
  capacity: 'mesh.capacity',
} as const;

export type SessionSetting = (typeof SESSION_SETTINGS)[keyof typeof SESSION_SETTINGS];

const TOKEN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;

export class SessionContextError extends Error {
  readonly field: string;
  constructor(field: string) {
    super(`actor context invalid: ${field}`);
    this.name = 'SessionContextError';
    this.field = field;
  }
}

function token(field: string, value: string): string {
  if (!TOKEN.test(value)) throw new SessionContextError(field);
  return value;
}

function list(field: string, values: readonly string[]): string {
  return values.map((v) => token(field, v)).join(',');
}

export type SessionValues = readonly (readonly [SessionSetting, string])[];

export function serializeContext(context: ActorContext | null): SessionValues {
  if (context === null) {
    return Object.values(SESSION_SETTINGS).map((setting) => [setting, ''] as const);
  }
  return [
    [SESSION_SETTINGS.actorId, token('actorId', context.actorId)],
    [SESSION_SETTINGS.personIds, list('personIds', context.personIds)],
    [SESSION_SETTINGS.orgIds, list('orgIds', context.orgIds)],
    [SESSION_SETTINGS.collabIds, list('collabIds', context.collabIds)],
    [SESSION_SETTINGS.purpose, token('purpose', context.purpose)],
    [
      SESSION_SETTINGS.capacity,
      context.capacity === null ? '' : token('capacity', context.capacity),
    ],
  ];
}

/** One parameterized statement that binds every setting for the current transaction. */
export function bindSessionStatement(context: ActorContext | null): SqlStatement {
  const values = serializeContext(context);
  const calls = values.map(
    (_, i) => `set_config($${String(2 * i + 1)}, $${String(2 * i + 2)}, true)`,
  );
  return { text: `SELECT ${calls.join(', ')}`, values: values.flatMap(([k, v]) => [k, v]) };
}
