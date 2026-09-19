-- Foundation 001 §5.2, §5.3 rule 6, §6.5 — domain database (provider_mesh).
-- Run against provider_mesh as the provisioning (owner) role, after 01_roles.sql.
-- Idempotent.
--
-- psql variables required (passed with -v):
--   instance_id   UUID for this instance
--   environment   development | ci | staging | production

\set ON_ERROR_STOP on

-- Connection is deny-by-default; only the roles that need this database get it.
REVOKE CONNECT ON DATABASE provider_mesh FROM PUBLIC;
GRANT  CONNECT ON DATABASE provider_mesh TO mesh_migrate, mesh_app;

-- mesh_migrate owns the database and the schema; migrations run as mesh_migrate
-- and therefore own every object they create (spec §5.2, §5.4).
ALTER DATABASE provider_mesh OWNER TO mesh_migrate;
ALTER SCHEMA public OWNER TO mesh_migrate;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT  USAGE  ON SCHEMA public TO mesh_app;

-- Default privileges for objects mesh_migrate will create in migrations.
-- DML on domain tables goes to mesh_app; the migration ledger is made
-- SELECT-only for mesh_app by the migration that creates it (spec §5.2).
-- Sequences are needed for identity/serial columns.
ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mesh_app;
ALTER DEFAULT PRIVILEGES FOR ROLE mesh_migrate IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO mesh_app;

-- Instance-identity marker (ADR-001 §6.3 rule 8; spec §5.3 rules 3 and 6).
-- Written here, once, by provisioning; never by the application; the migration
-- mechanism verifies it. Single-row by constraint.
SET ROLE mesh_migrate;

CREATE TABLE IF NOT EXISTS mesh_instance (
  singleton    boolean     NOT NULL DEFAULT true UNIQUE CHECK (singleton),
  instance_id  uuid        NOT NULL,
  environment  text        NOT NULL CHECK (environment IN ('development','ci','staging','production')),
  database_role text       NOT NULL DEFAULT 'domain' CHECK (database_role = 'domain'),
  created_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO mesh_instance (instance_id, environment)
VALUES (:'instance_id'::uuid, :'environment')
ON CONFLICT (singleton) DO NOTHING;

-- Refuse silently-wrong re-runs: the marker must match what was requested.
-- (psql does not interpolate :'vars' inside dollar-quoted blocks, so the
-- requested values are passed through session settings.)
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

-- The application and audit roles may read the marker; nothing may write it.
GRANT SELECT ON mesh_instance TO mesh_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON mesh_instance FROM mesh_app;

RESET ROLE;
