-- Foundation 001 §6.5 — CONSOLE PROCEDURE, step B.
-- Paste this whole file into the Neon SQL Editor with database
-- **provider_mesh_audit** selected, and run it. It is the SQL-Editor
-- equivalent of sql/03_audit_db.sql. The roles already exist (roles are
-- cluster-wide); this file sets the audit database's grants, ownership, and
-- the instance marker.
--
-- BEFORE RUNNING: paste the PROVIDER_MESH_INSTANCE_ID value from step A's
-- output into the instance_id parameter below. The two databases must carry
-- the same marker.

-- ===== parameters =====
-- (temp tables from an earlier run in this editor session are cleared first)
DROP TABLE IF EXISTS provision_params;
CREATE TEMP TABLE IF NOT EXISTS provision_params AS
SELECT
  'development'::text                                   AS environment,   -- same as step A
  NULL::uuid                                            AS instance_id;   -- <-- replace NULL::uuid with '<id from step A>'::uuid

DO $$
DECLARE
  p        record;
  have_id  uuid;
  have_env text;
BEGIN
  SELECT * INTO p FROM provision_params;
  IF p.instance_id IS NULL THEN
    RAISE EXCEPTION 'instance_id has not been set; replace NULL::uuid in provision_params with the PROVIDER_MESH_INSTANCE_ID value from step A';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_migrate') THEN
    RAISE EXCEPTION 'roles not found; run step A against provider_mesh first';
  END IF;

  EXECUTE format('GRANT mesh_migrate TO %I', current_user);

  REVOKE CONNECT ON DATABASE provider_mesh_audit FROM PUBLIC;
  GRANT  CONNECT ON DATABASE provider_mesh_audit TO mesh_migrate, mesh_audit_writer, mesh_audit_reader;
  -- mesh_app deliberately absent (spec A13).

  ALTER DATABASE provider_mesh_audit OWNER TO mesh_migrate;
  ALTER SCHEMA public OWNER TO mesh_migrate;
  REVOKE CREATE ON SCHEMA public FROM PUBLIC;
  GRANT  USAGE  ON SCHEMA public TO mesh_audit_writer, mesh_audit_reader;
  ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public GRANT SELECT ON TABLES TO mesh_audit_reader;
  ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO mesh_audit_writer;

  SET LOCAL ROLE mesh_migrate;
  CREATE TABLE IF NOT EXISTS mesh_instance (
    singleton     boolean     NOT NULL DEFAULT true UNIQUE CHECK (singleton),
    instance_id   uuid        NOT NULL,
    environment   text        NOT NULL CHECK (environment IN ('development','ci','staging','production')),
    database_role text        NOT NULL DEFAULT 'audit' CHECK (database_role = 'audit'),
    created_at    timestamptz NOT NULL DEFAULT now()
  );
  INSERT INTO mesh_instance (instance_id, environment) VALUES (p.instance_id, p.environment) ON CONFLICT (singleton) DO NOTHING;
  SELECT instance_id, environment INTO have_id, have_env FROM mesh_instance;
  IF have_id <> p.instance_id OR have_env <> p.environment THEN
    RAISE EXCEPTION 'mesh_instance already holds instance_id=% environment=%, which differs from the requested instance_id=% environment=%. This database belongs to another instance; refusing to continue.', have_id, have_env, p.instance_id, p.environment;
  END IF;
  GRANT SELECT ON mesh_instance TO mesh_audit_writer, mesh_audit_reader;
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON mesh_instance FROM mesh_audit_writer, mesh_audit_reader;
  RESET ROLE;
END
$$;

-- ===== verification =====
SELECT 'mesh_app can connect to audit db' AS item,
       CASE WHEN has_database_privilege('mesh_app','provider_mesh_audit','CONNECT') THEN 'FAIL' ELSE 'OK (denied)' END AS status
UNION ALL
SELECT 'audit marker', instance_id::text || ' / ' || environment FROM mesh_instance;
