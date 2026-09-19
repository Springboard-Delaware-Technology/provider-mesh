-- Foundation 001 §6.5 — CONSOLE PROCEDURE, step A.
-- Paste this whole file into the Neon SQL Editor with database **provider_mesh**
-- selected, and run it. It is the SQL-Editor equivalent of sql/01_roles.sql +
-- sql/02_domain_db.sql: it creates the four roles (in SQL, so they are NOT
-- neon_superuser members), sets grants and ownership, writes the instance
-- marker, and returns the secret values ONCE as the query result.
--
-- Set the environment below before running. Leave instance_id as NULL to
-- generate one; on a re-run, paste the recorded instance_id so the marker
-- check passes instead of aborting.

-- ===== parameters =====
-- (temp tables from an earlier run in this editor session are cleared first)
DROP TABLE IF EXISTS provision_params;
DROP TABLE IF EXISTS provision_out;
CREATE TEMP TABLE IF NOT EXISTS provision_params AS
SELECT
  'development'::text                       AS environment,   -- development | staging | production
  NULL::uuid                                AS instance_id;   -- NULL = generate

-- ===== derived values (kept for this session only) =====
CREATE TEMP TABLE IF NOT EXISTS provision_out (k text PRIMARY KEY, v text);

DO $$
DECLARE
  p          record;
  iid        uuid;
  pw_migrate text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_app     text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_aw      text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_ar      text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  have_id    uuid;
  have_env   text;
BEGIN
  SELECT * INTO p FROM provision_params;
  IF p.environment NOT IN ('development','staging','production') THEN
    RAISE EXCEPTION 'environment must be development, staging, or production (got %)', p.environment;
  END IF;
  iid := coalesce(p.instance_id, gen_random_uuid());

  -- roles (idempotent create; attributes and passwords set unconditionally)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_migrate')      THEN CREATE ROLE mesh_migrate;      END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_app')          THEN CREATE ROLE mesh_app;          END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_audit_writer') THEN CREATE ROLE mesh_audit_writer; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_audit_reader') THEN CREATE ROLE mesh_audit_reader; END IF;

  EXECUTE format('ALTER ROLE mesh_migrate      WITH LOGIN NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD %L', pw_migrate);
  EXECUTE format('ALTER ROLE mesh_app          WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_app);
  EXECUTE format('ALTER ROLE mesh_audit_writer WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_aw);
  EXECUTE format('ALTER ROLE mesh_audit_reader WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_ar);
  EXECUTE format('GRANT mesh_migrate TO %I', current_user);

  -- connect grants: deny-by-default
  REVOKE CONNECT ON DATABASE provider_mesh FROM PUBLIC;
  GRANT  CONNECT ON DATABASE provider_mesh TO mesh_migrate, mesh_app;

  -- ownership and schema
  ALTER DATABASE provider_mesh OWNER TO mesh_migrate;
  ALTER SCHEMA public OWNER TO mesh_migrate;
  REVOKE CREATE ON SCHEMA public FROM PUBLIC;
  GRANT  USAGE  ON SCHEMA public TO mesh_app;
  ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mesh_app;
  ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO mesh_app;

  -- instance marker, owned by mesh_migrate
  SET LOCAL ROLE mesh_migrate;
  CREATE TABLE IF NOT EXISTS mesh_instance (
    singleton     boolean     NOT NULL DEFAULT true UNIQUE CHECK (singleton),
    instance_id   uuid        NOT NULL,
    environment   text        NOT NULL CHECK (environment IN ('development','ci','staging','production')),
    database_role text        NOT NULL DEFAULT 'domain' CHECK (database_role = 'domain'),
    created_at    timestamptz NOT NULL DEFAULT now()
  );
  INSERT INTO mesh_instance (instance_id, environment) VALUES (iid, p.environment) ON CONFLICT (singleton) DO NOTHING;
  SELECT instance_id, environment INTO have_id, have_env FROM mesh_instance;
  IF have_id <> iid OR have_env <> p.environment THEN
    RAISE EXCEPTION 'mesh_instance already holds instance_id=% environment=%, which differs from the requested instance_id=% environment=%. This database belongs to another instance; refusing to continue.', have_id, have_env, iid, p.environment;
  END IF;
  GRANT SELECT ON mesh_instance TO mesh_app;
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON mesh_instance FROM mesh_app;
  RESET ROLE;

  INSERT INTO provision_out VALUES
    ('PROVIDER_MESH_INSTANCE_ID', iid::text),
    ('PROVIDER_MESH_ENVIRONMENT', p.environment),
    ('pw_mesh_migrate',      pw_migrate),
    ('pw_mesh_app',          pw_app),
    ('pw_mesh_audit_writer', pw_aw),
    ('pw_mesh_audit_reader', pw_ar)
  ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v;
END
$$;

-- ===== verification =====
SELECT 'role:' || rolname AS item,
       CASE WHEN rolbypassrls OR rolsuper OR rolcreatedb OR rolcreaterole THEN 'FAIL' ELSE 'OK' END AS status
FROM pg_roles WHERE rolname IN ('mesh_migrate','mesh_app','mesh_audit_writer','mesh_audit_reader')
UNION ALL
SELECT 'marker', instance_id::text || ' / ' || environment FROM mesh_instance
ORDER BY 1;

-- ===== SECRETS — shown once. Enter into Replit Secrets by name; then clear the editor. =====
-- Replace <ENDPOINT_HOST> with the host from the project's connection details
-- (the part after "@" and before "/", e.g. ep-xxxx-pooler.us-east-1.aws.neon.tech).
SELECT k AS name, v AS value FROM provision_out WHERE k LIKE 'PROVIDER_MESH_%'
UNION ALL
SELECT 'PROVIDER_MESH_DATABASE_URL',
       'postgresql://mesh_app:' || (SELECT v FROM provision_out WHERE k='pw_mesh_app') || '@<ENDPOINT_HOST>/provider_mesh?sslmode=verify-full&sslrootcert=system'
UNION ALL
SELECT 'PROVIDER_MESH_MIGRATE_URL',
       'postgresql://mesh_migrate:' || (SELECT v FROM provision_out WHERE k='pw_mesh_migrate') || '@<ENDPOINT_HOST>/provider_mesh?sslmode=verify-full&sslrootcert=system'
UNION ALL
SELECT 'PROVIDER_MESH_AUDIT_URL',
       'postgresql://mesh_audit_writer:' || (SELECT v FROM provision_out WHERE k='pw_mesh_audit_writer') || '@<ENDPOINT_HOST>/provider_mesh_audit?sslmode=verify-full&sslrootcert=system'
UNION ALL
SELECT 'PROVIDER_MESH_AUDIT_MIGRATE_URL',
       'postgresql://mesh_migrate:' || (SELECT v FROM provision_out WHERE k='pw_mesh_migrate') || '@<ENDPOINT_HOST>/provider_mesh_audit?sslmode=verify-full&sslrootcert=system'
UNION ALL
SELECT 'PROVIDER_MESH_AUDIT_READER_URL',
       'postgresql://mesh_audit_reader:' || (SELECT v FROM provision_out WHERE k='pw_mesh_audit_reader') || '@<ENDPOINT_HOST>/provider_mesh_audit?sslmode=verify-full&sslrootcert=system';
