-- Foundation 001 §6.5 — CONSOLE PROCEDURE, step C: role password rotation.
-- Run in the Neon SQL Editor with database **mesh_admin** selected.
--
-- Why a separate database: the Neon SQL Editor connects as the owner of the
-- selected database. provider_mesh and provider_mesh_audit are owned by
-- mesh_migrate, which by design cannot manage roles. mesh_admin is an empty
-- database owned by the console owner role (provider_mesh_owner), which
-- created the four roles and therefore holds ADMIN OPTION on them. Roles are
-- cluster-wide, so passwords set here apply to both application databases.
--
-- Set the two parameters below to the recorded values for the environment.
-- Running this rotates all four passwords; update Replit Secrets afterwards.

DROP TABLE IF EXISTS provision_params;
DROP TABLE IF EXISTS provision_out;

CREATE TEMP TABLE provision_params AS
SELECT
  'development'::text                                   AS environment,
  '543e37e2-0ffa-4576-8443-e37f1355e421'::uuid          AS instance_id;

CREATE TEMP TABLE provision_out (k text PRIMARY KEY, v text);

DO $$
DECLARE
  p          record;
  pw_migrate text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_app     text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_aw      text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  pw_ar      text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
BEGIN
  SELECT * INTO p FROM provision_params;

  IF current_user IN ('mesh_migrate','mesh_app','mesh_audit_writer','mesh_audit_reader') THEN
    RAISE EXCEPTION 'connected as %, which cannot manage roles. Select the mesh_admin database (owned by the console owner role) and run again.', current_user;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='mesh_migrate') THEN
    RAISE EXCEPTION 'roles not found; run step A first';
  END IF;

  -- This admin database must never be reachable by the application roles.
  REVOKE CONNECT ON DATABASE mesh_admin FROM PUBLIC;
  REVOKE CONNECT ON DATABASE mesh_admin FROM mesh_migrate, mesh_app, mesh_audit_writer, mesh_audit_reader;

  EXECUTE format('ALTER ROLE mesh_migrate      WITH LOGIN NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD %L', pw_migrate);
  EXECUTE format('ALTER ROLE mesh_app          WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_app);
  EXECUTE format('ALTER ROLE mesh_audit_writer WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_aw);
  EXECUTE format('ALTER ROLE mesh_audit_reader WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD %L', pw_ar);

  INSERT INTO provision_out VALUES
    ('PROVIDER_MESH_INSTANCE_ID', p.instance_id::text),
    ('PROVIDER_MESH_ENVIRONMENT', p.environment),
    ('pw_mesh_migrate',      pw_migrate),
    ('pw_mesh_app',          pw_app),
    ('pw_mesh_audit_writer', pw_aw),
    ('pw_mesh_audit_reader', pw_ar);
END
$$;

-- ===== verification =====
SELECT 'connected as' AS item, current_user::text AS status
UNION ALL
SELECT 'role:' || rolname,
       CASE WHEN rolbypassrls OR rolsuper OR rolcreatedb OR rolcreaterole THEN 'FAIL' ELSE 'OK' END
FROM pg_roles WHERE rolname IN ('mesh_migrate','mesh_app','mesh_audit_writer','mesh_audit_reader')
UNION ALL
SELECT 'mesh_app can connect to mesh_admin',
       CASE WHEN has_database_privilege('mesh_app','mesh_admin','CONNECT') THEN 'FAIL' ELSE 'OK (denied)' END
ORDER BY 1;

-- ===== SECRETS — shown once. Enter into Replit Secrets by name; then clear the editor. =====
-- Replace <ENDPOINT_HOST> with the host from the project's Connect panel.
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
