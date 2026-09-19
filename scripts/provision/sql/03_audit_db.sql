-- Foundation 001 §5.2, §5.5, §6.5 — audit database (provider_mesh_audit).
-- Run against provider_mesh_audit as the provisioning (owner) role, after
-- 01_roles.sql. Idempotent.
--
-- The audit database is a separate database in the same project (spec §17
-- decision 2). mesh_app holds NO privilege here, not even CONNECT (spec A13).
--
-- psql variables required (passed with -v):
--   instance_id, environment   (same values as 02_domain_db.sql)

\set ON_ERROR_STOP on

REVOKE CONNECT ON DATABASE provider_mesh_audit FROM PUBLIC;
GRANT  CONNECT ON DATABASE provider_mesh_audit TO mesh_migrate, mesh_audit_writer, mesh_audit_reader;
-- mesh_app deliberately absent.

ALTER DATABASE provider_mesh_audit OWNER TO mesh_migrate;
ALTER SCHEMA public OWNER TO mesh_migrate;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT  USAGE  ON SCHEMA public TO mesh_audit_writer, mesh_audit_reader;

-- Reader sees everything the migrations create; the writer gets nothing by
-- default — the migration that creates audit_event grants INSERT explicitly
-- and nothing else (spec §5.5 rule 2).
ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public
  GRANT SELECT ON TABLES TO mesh_audit_reader;
ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO mesh_audit_writer;

SET ROLE mesh_migrate;

CREATE TABLE IF NOT EXISTS mesh_instance (
  singleton     boolean     NOT NULL DEFAULT true UNIQUE CHECK (singleton),
  instance_id   uuid        NOT NULL,
  environment   text        NOT NULL CHECK (environment IN ('development','ci','staging','production')),
  database_role text        NOT NULL DEFAULT 'audit' CHECK (database_role = 'audit'),
  created_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO mesh_instance (instance_id, environment)
VALUES (:'instance_id'::uuid, :'environment')
ON CONFLICT (singleton) DO NOTHING;

SELECT set_config('provision.want_id',  :'instance_id', false) AS want_id \gset provision_
SELECT set_config('provision.want_env', :'environment', false) AS want_env \gset provision_

DO $$
DECLARE
  want_id  uuid := current_setting('provision.want_id')::uuid;
  want_env text := current_setting('provision.want_env');
  have_id  uuid;
  have_env text;
BEGIN
  SELECT instance_id, environment INTO have_id, have_env FROM mesh_instance;
  IF have_id <> want_id OR have_env <> want_env THEN
    RAISE EXCEPTION 'mesh_instance already holds instance_id=% environment=%, which differs from the requested instance_id=% environment=%. This database belongs to another instance; refusing to continue.',
      have_id, have_env, want_id, want_env;
  END IF;
END
$$;

GRANT SELECT ON mesh_instance TO mesh_audit_writer, mesh_audit_reader;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON mesh_instance FROM mesh_audit_writer, mesh_audit_reader;

RESET ROLE;
