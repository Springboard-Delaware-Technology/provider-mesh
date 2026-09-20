-- Foundation 001 §5.5 (C5) — second migration, audit database (provider_mesh_audit):
-- audit_event, its trigger-computed hash chain, the chain-head view, and the privileges that
-- keep the audit writer append-only and the domain identity a stranger (§5.2; ADR-001 §5.3,
-- §8.2; SEC-AUD-02, SEC-AUD-04).
--
-- Applied by db:migrate as mesh_migrate inside one transaction and recorded in migration_ledger.
-- Rules for every file in this directory (db/migrations/README.md): plain SQL, forward-only,
-- no transaction control, immutable once applied (§1.4 invariant 7).
--
-- CANONICAL SERIALIZATION, VERSION 1 (§1.8 delegated choice; §5.5 rule 1)
-- The hash of a row is the lowercase hex SHA-256 of the UTF-8 bytes of one JSON object text,
-- built in the RFC 8785 style, restricted to the value kinds these columns hold:
--   * one member per column of audit_event except hash, keyed by the column name, members
--     ordered by the UTF-16 code units of the name (plain ASCII order for these names), with
--     no whitespace anywhere;
--   * a NULL column is the literal null;
--   * text, and the domains over text, is a JSON string: " and \ escaped, U+0000–U+001F as
--     \b \f \n \r \t or \u00xx with lowercase hex, every other character as itself in UTF-8
--     (the encoding of to_json(text) and of JSON.stringify);
--   * uuid is a JSON string in its lowercase hyphenated form;
--   * integer and bigint are their decimal digits, unquoted;
--   * timestamptz is a JSON string in UTC with six fractional digits: YYYY-MM-DDTHH:MM:SS.ffffffZ;
--   * authority_refs is a JSON array of its elements as JSON strings, in stored order.
-- audit_event_canonical(audit_event) produces that text and audit_event_hash(audit_event) its
-- hash. audit:verify (db/audit/cli.ts over src/modules/audit/canonical.ts) rebuilds the same
-- text in TypeScript for every row and recomputes the hash independently of these functions.
-- Adding or removing a column of audit_event changes the serialization: that is a new
-- serialization version, shipped by a forward migration that records the first sequence it
-- applies to and extends audit:verify to apply each version to its own range.
--
-- ABSENCE (§5.5: "every nullable field distinguishes unknown from not applicable")
-- Each nullable content column has a paired <column>_absent column of domain audit_absence;
-- a check constraint requires exactly one of the pair to be null. A writer therefore records
-- either a value or the reason there is none ('unknown' or 'not_applicable'), never a bare null.

-- 1. Preconditions: applied as mesh_migrate, on top of the C4 ledger, with the audit roles able
--    to connect and the domain identity unable to (verified again here because this file's
--    privilege model depends on them).
DO $$
BEGIN
  IF current_user <> 'mesh_migrate' THEN
    RAISE EXCEPTION 'migrations are applied only as mesh_migrate (current role: %)', current_user;
  END IF;
  IF to_regclass('public.migration_ledger') IS NULL THEN
    RAISE EXCEPTION 'migration_ledger is absent: 0001_migration_ledger.sql must precede this file';
  END IF;
  -- The canonical serialization hashes UTF-8 bytes and the domains count characters: the
  -- store must be UTF-8 (Neon and the CI container are; a SQL_ASCII database is refused).
  IF current_setting('server_encoding') <> 'UTF8' THEN
    RAISE EXCEPTION 'the audit database must use the UTF8 server encoding (found %)', current_setting('server_encoding');
  END IF;
  IF has_database_privilege('mesh_app', current_database(), 'CONNECT') THEN
    RAISE EXCEPTION 'mesh_app must not be able to connect to the audit database (§5.2, A13)';
  END IF;
  IF NOT has_database_privilege('mesh_audit_writer', current_database(), 'CONNECT')
     OR NOT has_database_privilege('mesh_audit_reader', current_database(), 'CONNECT') THEN
    RAISE EXCEPTION 'provisioning incomplete: an audit role cannot connect to the audit database';
  END IF;
END
$$;

-- 2. Value domains: bounded lengths and alphabets for every text column (§5.5 rule 6), and the
--    two absence reasons.
CREATE DOMAIN audit_code AS text
  CHECK (VALUE ~ '^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$');
COMMENT ON DOMAIN audit_code IS
  'Foundation 001 §5.5: a code or vocabulary term — 1 to 128 characters of [A-Za-z0-9_.:/-], starting alphanumeric.';

CREATE DOMAIN audit_ref AS text
  CHECK (char_length(VALUE) BETWEEN 1 AND 256 AND VALUE !~ '[\x00-\x1F\x7F-\x9F]');
COMMENT ON DOMAIN audit_ref IS
  'Foundation 001 §5.5: an identifier or reference — 1 to 256 characters, no C0, DEL, or C1 control character. Never free text.';

CREATE DOMAIN audit_absence AS text
  CHECK (VALUE IN ('unknown', 'not_applicable'));
COMMENT ON DOMAIN audit_absence IS
  'Foundation 001 §5.5: why a nullable audit_event column holds no value — the Mesh does not know it (unknown) or it does not apply (not_applicable).';

-- 3. The audit event (SEC-AUD-02 field groups; §5.5).
CREATE TABLE audit_event (
  -- event identity
  event_id                          uuid          NOT NULL,
  event_type                        audit_code    NOT NULL,
  schema_version                    integer       NOT NULL CHECK (schema_version >= 1),
  correlation_id                    audit_ref     NOT NULL,
  causation_id                      audit_ref,
  causation_id_absent               audit_absence,
  -- actor
  actor_id                          audit_ref,
  actor_id_absent                   audit_absence,
  actor_kind                        text          NOT NULL
                                      CHECK (actor_kind IN ('human', 'service', 'system', 'unknown')),
  delegating_actor_id               audit_ref,
  delegating_actor_id_absent        audit_absence,
  represented_org_id                audit_ref,
  represented_org_id_absent         audit_absence,
  represented_unit_id               audit_ref,
  represented_unit_id_absent        audit_absence,
  represented_capacity              audit_code,
  represented_capacity_absent       audit_absence,
  -- time (Domain Model §4.2: recorded time is never substituted for the event's own time)
  occurred_at                       timestamptz   NOT NULL,
  recorded_at                       timestamptz   NOT NULL,
  external_time                     timestamptz,
  external_time_absent              audit_absence,
  time_uncertainty                  audit_code,
  time_uncertainty_absent           audit_absence,
  -- action and target
  operation                         audit_code    NOT NULL,
  target_type                       audit_code,
  target_type_absent                audit_absence,
  target_id                         audit_ref,
  target_id_absent                  audit_absence,
  target_version                    audit_ref,
  target_version_absent             audit_absence,
  subject_scope                     audit_ref,
  subject_scope_absent              audit_absence,
  destination_ref                   audit_ref,
  destination_ref_absent            audit_absence,
  -- authority
  authorization_decision_id         audit_ref,
  authorization_decision_id_absent  audit_absence,
  authority_refs                    audit_ref[]
                                      CHECK (authority_refs IS NULL
                                             OR (cardinality(authority_refs) BETWEEN 1 AND 64
                                                 AND array_position(authority_refs, NULL::audit_ref) IS NULL)),
  authority_refs_absent             audit_absence,
  policy_version                    audit_code,
  policy_version_absent             audit_absence,
  purpose                           audit_code,
  purpose_absent                    audit_absence,
  -- execution
  result                            text          NOT NULL
                                      CHECK (result IN ('attempted', 'completed', 'failed', 'unknown')),
  reason_code                       audit_code,
  reason_code_absent                audit_absence,
  before_version                    audit_ref,
  before_version_absent             audit_absence,
  after_version                     audit_ref,
  after_version_absent              audit_absence,
  external_receipt                  audit_ref,
  external_receipt_absent           audit_absence,
  -- accountability
  review_ref                        audit_ref,
  review_ref_absent                 audit_absence,
  origin_channel                    audit_code    NOT NULL,
  retention_class                   audit_code    NOT NULL,
  -- integrity: assigned by the chain trigger; any value a writer supplies is overwritten
  sequence                          bigint        NOT NULL CHECK (sequence >= 1),
  prev_hash                         text          NOT NULL CHECK (prev_hash ~ '^[0-9a-f]{64}$'),
  hash                              text          NOT NULL CHECK (hash ~ '^[0-9a-f]{64}$'),

  CONSTRAINT audit_event_pkey PRIMARY KEY (event_id),
  CONSTRAINT audit_event_sequence_key UNIQUE (sequence),
  CONSTRAINT audit_event_hash_key UNIQUE (hash),

  -- exactly one of each pair is null: a value, or the reason there is none
  CONSTRAINT audit_event_causation_id_paired
    CHECK ((causation_id IS NULL) = (causation_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_actor_id_paired
    CHECK ((actor_id IS NULL) = (actor_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_delegating_actor_id_paired
    CHECK ((delegating_actor_id IS NULL) = (delegating_actor_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_represented_org_id_paired
    CHECK ((represented_org_id IS NULL) = (represented_org_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_represented_unit_id_paired
    CHECK ((represented_unit_id IS NULL) = (represented_unit_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_represented_capacity_paired
    CHECK ((represented_capacity IS NULL) = (represented_capacity_absent IS NOT NULL)),
  CONSTRAINT audit_event_external_time_paired
    CHECK ((external_time IS NULL) = (external_time_absent IS NOT NULL)),
  CONSTRAINT audit_event_time_uncertainty_paired
    CHECK ((time_uncertainty IS NULL) = (time_uncertainty_absent IS NOT NULL)),
  CONSTRAINT audit_event_target_type_paired
    CHECK ((target_type IS NULL) = (target_type_absent IS NOT NULL)),
  CONSTRAINT audit_event_target_id_paired
    CHECK ((target_id IS NULL) = (target_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_target_version_paired
    CHECK ((target_version IS NULL) = (target_version_absent IS NOT NULL)),
  CONSTRAINT audit_event_subject_scope_paired
    CHECK ((subject_scope IS NULL) = (subject_scope_absent IS NOT NULL)),
  CONSTRAINT audit_event_destination_ref_paired
    CHECK ((destination_ref IS NULL) = (destination_ref_absent IS NOT NULL)),
  CONSTRAINT audit_event_authorization_decision_id_paired
    CHECK ((authorization_decision_id IS NULL) = (authorization_decision_id_absent IS NOT NULL)),
  CONSTRAINT audit_event_authority_refs_paired
    CHECK ((authority_refs IS NULL) = (authority_refs_absent IS NOT NULL)),
  CONSTRAINT audit_event_policy_version_paired
    CHECK ((policy_version IS NULL) = (policy_version_absent IS NOT NULL)),
  CONSTRAINT audit_event_purpose_paired
    CHECK ((purpose IS NULL) = (purpose_absent IS NOT NULL)),
  CONSTRAINT audit_event_reason_code_paired
    CHECK ((reason_code IS NULL) = (reason_code_absent IS NOT NULL)),
  CONSTRAINT audit_event_before_version_paired
    CHECK ((before_version IS NULL) = (before_version_absent IS NOT NULL)),
  CONSTRAINT audit_event_after_version_paired
    CHECK ((after_version IS NULL) = (after_version_absent IS NOT NULL)),
  CONSTRAINT audit_event_external_receipt_paired
    CHECK ((external_receipt IS NULL) = (external_receipt_absent IS NOT NULL)),
  CONSTRAINT audit_event_review_ref_paired
    CHECK ((review_ref IS NULL) = (review_ref_absent IS NOT NULL))
);

COMMENT ON TABLE audit_event IS
  'Foundation 001 §5.5: the audit chain (SEC-AUD-02 field groups). Appended only by the Audit Service as mesh_audit_writer; sequence, prev_hash, hash, and recorded_at are set by the audit_event_chain trigger; rows are never updated or deleted. Canonical serialization version 1 is documented in db/migrations/audit/0002_audit_event.sql.';
COMMENT ON COLUMN audit_event.sequence IS 'Chain position, head + 1, assigned under a transaction-scoped advisory lock.';
COMMENT ON COLUMN audit_event.prev_hash IS 'The previous row''s hash; 64 zeros for sequence 1 (genesis).';
COMMENT ON COLUMN audit_event.hash IS 'SHA-256 of canonical serialization version 1 of every other column.';
COMMENT ON COLUMN audit_event.recorded_at IS 'Trusted server time of recording, set by the chain trigger; occurred_at is the event''s own time.';

-- 4. Canonical serialization, version 1 (documented above). STABLE rather than IMMUTABLE
--    because to_char is catalogued as stable; these functions hold no state.
CREATE FUNCTION audit_json_text(v text) RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT coalesce(to_json(v)::text, 'null')
$$;

CREATE FUNCTION audit_json_time(v timestamptz) RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN v IS NULL THEN 'null'
              ELSE '"' || to_char(v AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') || '"'
         END
$$;

CREATE FUNCTION audit_json_refs(v audit_ref[]) RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN v IS NULL THEN 'null'
              ELSE '[' || coalesce((SELECT string_agg(to_json(e::text)::text, ',' ORDER BY ord)
                                      FROM unnest(v) WITH ORDINALITY AS u(e, ord)), '') || ']'
         END
$$;

CREATE FUNCTION audit_event_canonical(e audit_event) RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT '{'
    ||  '"actor_id":'                         || audit_json_text(e.actor_id)
    || ',"actor_id_absent":'                  || audit_json_text(e.actor_id_absent)
    || ',"actor_kind":'                       || audit_json_text(e.actor_kind)
    || ',"after_version":'                    || audit_json_text(e.after_version)
    || ',"after_version_absent":'             || audit_json_text(e.after_version_absent)
    || ',"authority_refs":'                   || audit_json_refs(e.authority_refs)
    || ',"authority_refs_absent":'            || audit_json_text(e.authority_refs_absent)
    || ',"authorization_decision_id":'        || audit_json_text(e.authorization_decision_id)
    || ',"authorization_decision_id_absent":' || audit_json_text(e.authorization_decision_id_absent)
    || ',"before_version":'                   || audit_json_text(e.before_version)
    || ',"before_version_absent":'            || audit_json_text(e.before_version_absent)
    || ',"causation_id":'                     || audit_json_text(e.causation_id)
    || ',"causation_id_absent":'              || audit_json_text(e.causation_id_absent)
    || ',"correlation_id":'                   || audit_json_text(e.correlation_id)
    || ',"delegating_actor_id":'              || audit_json_text(e.delegating_actor_id)
    || ',"delegating_actor_id_absent":'       || audit_json_text(e.delegating_actor_id_absent)
    || ',"destination_ref":'                  || audit_json_text(e.destination_ref)
    || ',"destination_ref_absent":'           || audit_json_text(e.destination_ref_absent)
    || ',"event_id":'                         || audit_json_text(e.event_id::text)
    || ',"event_type":'                       || audit_json_text(e.event_type)
    || ',"external_receipt":'                 || audit_json_text(e.external_receipt)
    || ',"external_receipt_absent":'          || audit_json_text(e.external_receipt_absent)
    || ',"external_time":'                    || audit_json_time(e.external_time)
    || ',"external_time_absent":'             || audit_json_text(e.external_time_absent)
    || ',"occurred_at":'                      || audit_json_time(e.occurred_at)
    || ',"operation":'                        || audit_json_text(e.operation)
    || ',"origin_channel":'                   || audit_json_text(e.origin_channel)
    || ',"policy_version":'                   || audit_json_text(e.policy_version)
    || ',"policy_version_absent":'            || audit_json_text(e.policy_version_absent)
    || ',"prev_hash":'                        || audit_json_text(e.prev_hash)
    || ',"purpose":'                          || audit_json_text(e.purpose)
    || ',"purpose_absent":'                   || audit_json_text(e.purpose_absent)
    || ',"reason_code":'                      || audit_json_text(e.reason_code)
    || ',"reason_code_absent":'               || audit_json_text(e.reason_code_absent)
    || ',"recorded_at":'                      || audit_json_time(e.recorded_at)
    || ',"represented_capacity":'             || audit_json_text(e.represented_capacity)
    || ',"represented_capacity_absent":'      || audit_json_text(e.represented_capacity_absent)
    || ',"represented_org_id":'               || audit_json_text(e.represented_org_id)
    || ',"represented_org_id_absent":'        || audit_json_text(e.represented_org_id_absent)
    || ',"represented_unit_id":'              || audit_json_text(e.represented_unit_id)
    || ',"represented_unit_id_absent":'       || audit_json_text(e.represented_unit_id_absent)
    || ',"result":'                           || audit_json_text(e.result)
    || ',"retention_class":'                  || audit_json_text(e.retention_class)
    || ',"review_ref":'                       || audit_json_text(e.review_ref)
    || ',"review_ref_absent":'                || audit_json_text(e.review_ref_absent)
    || ',"schema_version":'                   || coalesce(e.schema_version::text, 'null')
    || ',"sequence":'                         || coalesce(e.sequence::text, 'null')
    || ',"subject_scope":'                    || audit_json_text(e.subject_scope)
    || ',"subject_scope_absent":'             || audit_json_text(e.subject_scope_absent)
    || ',"target_id":'                        || audit_json_text(e.target_id)
    || ',"target_id_absent":'                 || audit_json_text(e.target_id_absent)
    || ',"target_type":'                      || audit_json_text(e.target_type)
    || ',"target_type_absent":'               || audit_json_text(e.target_type_absent)
    || ',"target_version":'                   || audit_json_text(e.target_version)
    || ',"target_version_absent":'            || audit_json_text(e.target_version_absent)
    || ',"time_uncertainty":'                 || audit_json_text(e.time_uncertainty)
    || ',"time_uncertainty_absent":'          || audit_json_text(e.time_uncertainty_absent)
    || '}'
$$;

CREATE FUNCTION audit_event_hash(e audit_event) RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT encode(sha256(convert_to(audit_event_canonical(e), 'UTF8')), 'hex')
$$;

-- 5. The chain trigger (§5.5 rule 1). SECURITY DEFINER, owned by mesh_migrate: the writer holds
--    no SELECT on audit_event, so the head is read with the definer's privilege. The
--    transaction-scoped advisory lock serializes concurrent appends; the head read after taking
--    it sees every committed row (READ COMMITTED takes a fresh snapshot per statement), so the
--    assigned sequence is head + 1 and prev_hash is the head's hash. A writer's own values for
--    sequence, prev_hash, hash, and recorded_at are discarded.
CREATE FUNCTION audit_event_chain() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  head_sequence bigint;
  head_hash     text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('provider_mesh.audit_event_chain'));
  SELECT sequence, hash INTO head_sequence, head_hash
    FROM audit_event ORDER BY sequence DESC LIMIT 1;
  IF NOT FOUND THEN
    head_sequence := 0;
    head_hash := repeat('0', 64);
  END IF;
  NEW.sequence    := head_sequence + 1;
  NEW.prev_hash   := head_hash;
  NEW.recorded_at := clock_timestamp();
  NEW.hash        := audit_event_hash(NEW);
  RETURN NEW;
END
$$;

CREATE TRIGGER audit_event_chain
  BEFORE INSERT ON audit_event
  FOR EACH ROW EXECUTE FUNCTION audit_event_chain();

-- 6. Append-only, even for the owner (SEC-AUD-04; §5.5 rule 2): the trigger refuses every
--    update, delete, and truncate. A lawful disposal under Security §18 is a later, explicit,
--    audited migration, never a session that disables this trigger.
CREATE FUNCTION audit_event_immutable() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_event is append-only (Foundation 001 §5.5 rule 2; SEC-AUD-04): rows are never updated, deleted, or truncated';
END
$$;

CREATE TRIGGER audit_event_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_event
  FOR EACH STATEMENT EXECUTE FUNCTION audit_event_immutable();

-- 7. The chain head (§5.2: the writer's only read). Owned by mesh_migrate, so it reads the table
--    with the owner's privilege; it exposes position and identity only, never content.
CREATE VIEW audit_chain_head AS
  SELECT sequence, hash, event_id, recorded_at
    FROM audit_event
   ORDER BY sequence DESC
   LIMIT 1;

COMMENT ON VIEW audit_chain_head IS
  'Foundation 001 §5.5: the newest audit_event row''s position, hash, event_id, and recording time; readable by mesh_audit_writer and mesh_audit_reader.';

-- 8. Privileges (§5.2; §5.5 rule 2; A13). Provisioning's default privileges gave the reader
--    SELECT on every table mesh_migrate creates; every grant is restated here explicitly so the
--    catalog carries exactly this set and nothing implicit.
REVOKE ALL ON TABLE audit_event FROM PUBLIC;
REVOKE ALL ON TABLE audit_event FROM mesh_audit_writer, mesh_audit_reader;
GRANT INSERT ON TABLE audit_event TO mesh_audit_writer;
GRANT SELECT ON TABLE audit_event TO mesh_audit_reader;

REVOKE ALL ON audit_chain_head FROM PUBLIC;
REVOKE ALL ON audit_chain_head FROM mesh_audit_writer, mesh_audit_reader;
GRANT SELECT ON audit_chain_head TO mesh_audit_writer, mesh_audit_reader;

REVOKE EXECUTE ON FUNCTION audit_event_chain() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION audit_event_immutable() FROM PUBLIC;

-- 9. Postconditions: what db:verify and the audit tests will assert, checked once here so a
--    provisioning drift fails the migration rather than the next release.
DO $$
DECLARE
  chain_fn record;
BEGIN
  SELECT f.prosecdef, r.rolname AS owner INTO chain_fn
    FROM pg_proc f JOIN pg_roles r ON r.oid = f.proowner
   WHERE f.proname = 'audit_event_chain' AND f.pronamespace = 'public'::regnamespace;
  IF NOT FOUND OR NOT chain_fn.prosecdef OR chain_fn.owner <> 'mesh_migrate' THEN
    RAISE EXCEPTION 'audit_event_chain must be SECURITY DEFINER and owned by mesh_migrate (§5.5 rule 1)';
  END IF;
  IF has_table_privilege('mesh_audit_writer', 'audit_event', 'SELECT')
     OR has_table_privilege('mesh_audit_writer', 'audit_event', 'UPDATE')
     OR has_table_privilege('mesh_audit_writer', 'audit_event', 'DELETE')
     OR has_table_privilege('mesh_audit_writer', 'audit_event', 'TRUNCATE')
     OR NOT has_table_privilege('mesh_audit_writer', 'audit_event', 'INSERT') THEN
    RAISE EXCEPTION 'mesh_audit_writer must hold INSERT and nothing else on audit_event (§5.2)';
  END IF;
  IF has_table_privilege('mesh_audit_reader', 'audit_event', 'INSERT')
     OR has_table_privilege('mesh_audit_reader', 'audit_event', 'UPDATE')
     OR has_table_privilege('mesh_audit_reader', 'audit_event', 'DELETE')
     OR has_table_privilege('mesh_audit_reader', 'audit_event', 'TRUNCATE')
     OR NOT has_table_privilege('mesh_audit_reader', 'audit_event', 'SELECT') THEN
    RAISE EXCEPTION 'mesh_audit_reader must hold SELECT and nothing else on audit_event (§5.2)';
  END IF;
  IF has_table_privilege('mesh_app', 'audit_event', 'SELECT')
     OR has_table_privilege('mesh_app', 'audit_event', 'INSERT') THEN
    RAISE EXCEPTION 'mesh_app must hold no privilege on audit_event (§1.4 invariant 2)';
  END IF;
  IF NOT has_table_privilege('mesh_audit_writer', 'audit_chain_head', 'SELECT')
     OR NOT has_table_privilege('mesh_audit_reader', 'audit_chain_head', 'SELECT') THEN
    RAISE EXCEPTION 'both audit roles must read audit_chain_head (§5.2)';
  END IF;
END
$$;
