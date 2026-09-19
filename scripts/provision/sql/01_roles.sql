-- Foundation 001 §5.2 / §6.5 — application roles.
-- Run once per environment against the domain database, as the provisioning
-- (owner) role. Idempotent: creates roles that are missing, then sets
-- attributes and passwords unconditionally.
--
-- Roles are created here in SQL rather than through the Neon console or API,
-- because console/API-created roles are granted neon_superuser, which carries
-- pg_read_all_data / pg_write_all_data and would let mesh_app bypass every
-- table grant this package depends on.
--
-- psql variables required (passed with -v):
--   mesh_migrate_pw, mesh_app_pw, mesh_audit_writer_pw, mesh_audit_reader_pw

\set ON_ERROR_STOP on

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mesh_migrate') THEN
    CREATE ROLE mesh_migrate;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mesh_app') THEN
    CREATE ROLE mesh_app;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mesh_audit_writer') THEN
    CREATE ROLE mesh_audit_writer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mesh_audit_reader') THEN
    CREATE ROLE mesh_audit_reader;
  END IF;
END
$$;

-- Attributes are set unconditionally so a re-run repairs drift.
-- SUPERUSER and BYPASSRLS are not named here: only a superuser may write them,
-- and Neon's owner role is not one. Roles created by a non-superuser get both
-- attributes false, and the verification step confirms it (ADR-001 §5.2; spec A12).
ALTER ROLE mesh_migrate      WITH LOGIN NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD :'mesh_migrate_pw';
ALTER ROLE mesh_app          WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD :'mesh_app_pw';
ALTER ROLE mesh_audit_writer WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD :'mesh_audit_writer_pw';
ALTER ROLE mesh_audit_reader WITH LOGIN NOCREATEDB NOCREATEROLE INHERIT   PASSWORD :'mesh_audit_reader_pw';

-- The provisioning role must be able to SET ROLE mesh_migrate to create
-- objects that mesh_migrate owns (02/03 below).
GRANT mesh_migrate TO CURRENT_USER;

-- Verify the attributes we could not write directly.
DO $$
DECLARE bad text;
BEGIN
  SELECT string_agg(rolname, ', ') INTO bad FROM pg_roles
   WHERE rolname IN ('mesh_migrate','mesh_app','mesh_audit_writer','mesh_audit_reader')
     AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole);
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'roles carry a privileged attribute (superuser, bypassrls, createdb, or createrole): %', bad;
  END IF;
END
$$;
