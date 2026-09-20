-- Foundation 001 §5.4 (C4) — first migration, audit database (provider_mesh_audit).
--
-- Applied by db:migrate as mesh_migrate inside one transaction and recorded in the ledger this
-- file creates. It first verifies what the §6.5 provisioning procedure created (the four roles
-- without privileged attributes, the connect grants including the denial of mesh_app, and the
-- single instance marker for this database role), then creates migration_ledger readable by the
-- audit roles and writable by nothing but db:migrate (§5.2, §5.5). The marker's identity is
-- checked by the migration mechanism against PROVIDER_MESH_INSTANCE_ID and
-- PROVIDER_MESH_ENVIRONMENT before this file runs.
--
-- Rules for every file in this directory (db/migrations/README.md): plain SQL, forward-only,
-- no transaction control, immutable once applied (§1.4 invariant 7).

-- 1. Provisioning preconditions (§5.2; §5.3 rule 6; §5.4; A13 groundwork).
DO $$
DECLARE
  missing     text;
  privileged  text;
  marker_rows integer;
  marker_role text;
BEGIN
  IF current_user <> 'mesh_migrate' THEN
    RAISE EXCEPTION 'migrations are applied only as mesh_migrate (current role: %)', current_user;
  END IF;

  SELECT string_agg(r, ', ' ORDER BY r) INTO missing
    FROM unnest(ARRAY['mesh_migrate', 'mesh_app', 'mesh_audit_writer', 'mesh_audit_reader']) AS r
   WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r);
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'provisioning incomplete: role(s) missing: %', missing;
  END IF;

  SELECT string_agg(rolname, ', ' ORDER BY rolname) INTO privileged
    FROM pg_roles
   WHERE rolname IN ('mesh_migrate', 'mesh_app', 'mesh_audit_writer', 'mesh_audit_reader')
     AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole);
  IF privileged IS NOT NULL THEN
    RAISE EXCEPTION 'role(s) carry a privileged attribute (superuser, bypassrls, createdb, or createrole): %', privileged;
  END IF;

  IF has_database_privilege('mesh_app', current_database(), 'CONNECT') THEN
    RAISE EXCEPTION 'mesh_app must not be able to connect to the audit database (§5.2, A13)';
  END IF;
  IF NOT has_database_privilege('mesh_audit_writer', current_database(), 'CONNECT')
     OR NOT has_database_privilege('mesh_audit_reader', current_database(), 'CONNECT') THEN
    RAISE EXCEPTION 'provisioning incomplete: an audit role cannot connect to the audit database';
  END IF;

  IF to_regclass('public.mesh_instance') IS NULL THEN
    RAISE EXCEPTION 'provisioning incomplete: mesh_instance is absent';
  END IF;
  SELECT count(*), min(database_role) INTO marker_rows, marker_role FROM mesh_instance;
  IF marker_rows <> 1 THEN
    RAISE EXCEPTION 'mesh_instance must hold exactly one row (found %)', marker_rows;
  END IF;
  IF marker_role <> 'audit' THEN
    RAISE EXCEPTION 'mesh_instance.database_role is %, expected audit', marker_role;
  END IF;
END
$$;

-- 2. The ledger (§5.4): one row per applied migration file. Only db:migrate writes it.
CREATE TABLE migration_ledger (
  filename       text        PRIMARY KEY CHECK (filename ~ '^[0-9]{4}_[a-z0-9_]+\.sql$'),
  sha256         text        NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  applied_at     timestamptz NOT NULL DEFAULT now(),
  applied_by     text        NOT NULL DEFAULT current_user,
  catalog_sha256 text        NOT NULL CHECK (catalog_sha256 ~ '^[0-9a-f]{64}$')
);

COMMENT ON TABLE migration_ledger IS
  'Foundation 001 §5.4: applied migrations (file SHA-256, server time, applying role, catalog checksum after application). Written only by db:migrate as mesh_migrate; rows are immutable.';

-- 3. Immutability (§1.4 invariant 7; Governance §12.4): no row is updated, deleted, or truncated,
--    even by the owner. Removing this trigger would itself change the catalog checksum that
--    db:verify compares with the ledger head.
CREATE FUNCTION migration_ledger_immutable() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'migration_ledger is immutable (Foundation 001 §1.4 invariant 7): corrections are new forward migrations';
END
$$;

CREATE TRIGGER migration_ledger_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON migration_ledger
  FOR EACH STATEMENT EXECUTE FUNCTION migration_ledger_immutable();

-- 4. Privileges (§5.2, §5.5): the audit writer reads the ledger for the application's startup
--    assertion on the audit store (§5.3 rule 4); the reader reads it for audit:verify. Neither
--    holds anything else on it. Provisioning's default privileges already give the reader SELECT
--    on every table mesh_migrate creates; the grant below makes that explicit.
REVOKE ALL ON TABLE migration_ledger FROM PUBLIC;
REVOKE ALL ON TABLE migration_ledger FROM mesh_audit_writer, mesh_audit_reader;
GRANT SELECT ON TABLE migration_ledger TO mesh_audit_writer, mesh_audit_reader;
