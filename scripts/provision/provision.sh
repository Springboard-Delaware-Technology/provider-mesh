#!/usr/bin/env bash
# Foundation 001 §6.5 — environment provisioning procedure.
#
# Creates (or verifies) one Provider Mesh environment from nothing:
#   - a Neon project in a named region and Postgres major version   (target=neon)
#   - the two databases: provider_mesh and provider_mesh_audit
#   - the four application roles with their grants (sql/01_roles.sql)
#   - the instance-identity marker in both databases (sql/02, sql/03)
# and prints the SECRET NAMES whose values the operator must then record.
#
# Executed only by the decision authority, from outside any agent context,
# with a Neon API key that no agent ever holds (ADR-001 §8.1, §8.3).
# Agents may run it with --target container against a local/CI Postgres.
#
# Requires: bash 4+, curl, jq, psql (PostgreSQL 16+ client for sslrootcert=system).
# The API key is read from an interactive prompt, never from an argument,
# environment variable, or file. Passwords are generated locally, printed
# once, and never written to disk.
#
# Usage:
#   ./provision.sh --target neon --environment development \
#       [--project-name provider-mesh-development] [--region aws-us-east-1] \
#       [--pg-version 18] [--org-id org_xxx]
#
#   ./provision.sh --target container --environment ci \
#       --admin-url postgresql://postgres:postgres@localhost:5432/postgres
#
# Idempotent: re-running against the same environment verifies rather than
# recreates; a mismatched instance marker aborts.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$SCRIPT_DIR/sql"
NEON_API="https://console.neon.tech/api/v2"

# ---------- arguments ----------
TARGET=""            # neon | container
ENVIRONMENT=""       # development | ci | staging | production
PROJECT_NAME=""
REGION="aws-us-east-1"
PG_VERSION="18"
ORG_ID=""
ADMIN_URL=""         # container target only
INSTANCE_ID=""       # optional; generated if absent

usage() { sed -n '2,30p' "$0"; exit 2; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)        TARGET="$2"; shift 2 ;;
    --environment)   ENVIRONMENT="$2"; shift 2 ;;
    --project-name)  PROJECT_NAME="$2"; shift 2 ;;
    --region)        REGION="$2"; shift 2 ;;
    --pg-version)    PG_VERSION="$2"; shift 2 ;;
    --org-id)        ORG_ID="$2"; shift 2 ;;
    --admin-url)     ADMIN_URL="$2"; shift 2 ;;
    --instance-id)   INSTANCE_ID="$2"; shift 2 ;;
    -h|--help)       usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

[[ "$TARGET" == "neon" || "$TARGET" == "container" ]] || { echo "--target must be neon or container" >&2; exit 2; }
case "$ENVIRONMENT" in development|ci|staging|production) ;; *) echo "--environment must be development|ci|staging|production" >&2; exit 2 ;; esac
[[ "$TARGET" == "container" && -z "$ADMIN_URL" ]] && { echo "--admin-url is required for --target container" >&2; exit 2; }
[[ "$TARGET" == "neon" && "$ENVIRONMENT" == "ci" ]] && { echo "ci environments are container-only" >&2; exit 2; }
[[ "$REGION" == aws-us-* || "$REGION" == azure-*us* ]] || { echo "ADR-001 §7: region must be in the United States (got $REGION)" >&2; exit 2; }
[[ -z "$PROJECT_NAME" ]] && PROJECT_NAME="provider-mesh-${ENVIRONMENT}"

for tool in curl jq psql; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing required tool: $tool" >&2; exit 2; }
done

log()  { printf '[provision] %s\n' "$*" >&2; }
die()  { printf '[provision] ERROR: %s\n' "$*" >&2; exit 1; }
gen_pw() { openssl rand -base64 30 | tr -d '/+=' | cut -c1-32; }
gen_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then uuidgen | tr 'A-Z' 'a-z';
  elif [[ -r /proc/sys/kernel/random/uuid ]]; then cat /proc/sys/kernel/random/uuid;
  else python3 -c 'import uuid; print(uuid.uuid4())'; fi
}

# with_db <url> <dbname> [<query>]: replace the database path of a Postgres URL,
# preserving any existing query string (or replacing it when a third arg is given).
with_db() {
  local url="$1" db="$2" q=""
  if [[ "$url" == *\?* ]]; then q="${url#*\?}"; url="${url%%\?*}"; fi
  [[ $# -ge 3 ]] && q="$3"
  local base="${url%/*}"
  if [[ -n "$q" ]]; then echo "$base/$db?$q"; else echo "$base/$db"; fi
}
host_of() { local h; h="$(echo "${1%%\?*}" | sed -nE 's#^postgres(ql)?://([^@/]+@)?([^/:@]+).*#\3#p')"; echo "${h:-localhost}"; }

[[ -z "$INSTANCE_ID" ]] && INSTANCE_ID="$(gen_uuid)"

# ---------- credentials for the four roles (generated locally, printed once) ----------
PW_MIGRATE="$(gen_pw)"; PW_APP="$(gen_pw)"; PW_AUDIT_W="$(gen_pw)"; PW_AUDIT_R="$(gen_pw)"

# ---------- target: neon ----------
if [[ "$TARGET" == "neon" ]]; then
  log "Neon target: project=$PROJECT_NAME region=$REGION pg=$PG_VERSION environment=$ENVIRONMENT"
  read -r -s -p "Neon API key (input hidden; not stored): " NEON_API_KEY; echo >&2
  [[ -n "$NEON_API_KEY" ]] || die "empty API key"

  api() { # method path [json-body]
    local m="$1" p="$2" b="${3:-}"
    if [[ -n "$b" ]]; then
      curl -sS -f -X "$m" "$NEON_API$p" -H "Authorization: Bearer $NEON_API_KEY" -H "Accept: application/json" -H "Content-Type: application/json" -d "$b"
    else
      curl -sS -f -X "$m" "$NEON_API$p" -H "Authorization: Bearer $NEON_API_KEY" -H "Accept: application/json"
    fi
  }

  # Organization
  if [[ -z "$ORG_ID" ]]; then
    ORGS_JSON="$(api GET /users/me/organizations)" || die "could not list organizations (check the API key)"
    ORG_COUNT="$(echo "$ORGS_JSON" | jq '.organizations | length')"
    if [[ "$ORG_COUNT" -eq 1 ]]; then
      ORG_ID="$(echo "$ORGS_JSON" | jq -r '.organizations[0].id')"
      log "using organization $(echo "$ORGS_JSON" | jq -r '.organizations[0].name') ($ORG_ID)"
    else
      echo "$ORGS_JSON" | jq -r '.organizations[] | "  \(.id)  \(.name)"' >&2
      die "more than one organization; re-run with --org-id <id> for the Springboard organization"
    fi
  fi

  # Project: reuse if a project of this name already exists in the org, else create.
  EXISTING="$(api GET "/projects?org_id=$ORG_ID&search=$PROJECT_NAME&limit=50" | jq -r --arg n "$PROJECT_NAME" '.projects[] | select(.name==$n) | .id' | head -n1)"
  if [[ -n "$EXISTING" ]]; then
    PROJECT_ID="$EXISTING"
    log "project '$PROJECT_NAME' already exists ($PROJECT_ID); verifying rather than creating"
    PROJ_JSON="$(api GET "/projects/$PROJECT_ID")"
    ACTUAL_REGION="$(echo "$PROJ_JSON" | jq -r '.project.region_id')"
    ACTUAL_PG="$(echo "$PROJ_JSON" | jq -r '.project.pg_version')"
    [[ "$ACTUAL_REGION" == "$REGION" ]] || die "existing project is in $ACTUAL_REGION, not $REGION"
    [[ "$ACTUAL_PG" == "$PG_VERSION" ]] || die "existing project runs Postgres $ACTUAL_PG, not $PG_VERSION"
    BRANCH_ID="$(api GET "/projects/$PROJECT_ID/branches" | jq -r '.branches[] | select(.default==true) | .id')"
    log "existing project: an owner connection string is needed to continue."
    read -r -s -p "Owner connection string for database provider_mesh (input hidden; not stored): " OWNER_DOMAIN_URL; echo >&2
    [[ -n "$OWNER_DOMAIN_URL" ]] || die "empty connection string"
  else
    log "creating project '$PROJECT_NAME'"
    CREATE_BODY="$(jq -n --arg n "$PROJECT_NAME" --arg r "$REGION" --arg o "$ORG_ID" --argjson pg "$PG_VERSION" \
      '{project:{name:$n, region_id:$r, org_id:$o, pg_version:$pg, branch:{name:"main", database_name:"provider_mesh", role_name:"mesh_owner"}}}')"
    CREATED="$(api POST /projects "$CREATE_BODY")" || die "project creation failed; the API response above names the field it rejected"
    PROJECT_ID="$(echo "$CREATED" | jq -r '.project.id')"
    BRANCH_ID="$(echo "$CREATED" | jq -r '.branch.id')"
    OWNER_DOMAIN_URL="$(echo "$CREATED" | jq -r '.connection_uris[0].connection_uri')"
    [[ -n "$PROJECT_ID" && -n "$BRANCH_ID" && -n "$OWNER_DOMAIN_URL" && "$OWNER_DOMAIN_URL" != "null" ]] || die "unexpected create-project response"
    log "created project $PROJECT_ID (branch $BRANCH_ID)"
  fi

  # Second database, owned by the same owner role.
  OWNER_ROLE="$(echo "$OWNER_DOMAIN_URL" | sed -E 's#^postgres(ql)?://([^:]+):.*#\2#')"
  HAS_AUDIT="$(api GET "/projects/$PROJECT_ID/branches/$BRANCH_ID/databases" | jq -r '.databases[] | select(.name=="provider_mesh_audit") | .name')"
  if [[ -z "$HAS_AUDIT" ]]; then
    log "creating database provider_mesh_audit"
    api POST "/projects/$PROJECT_ID/branches/$BRANCH_ID/databases" \
      "$(jq -n --arg o "$OWNER_ROLE" '{database:{name:"provider_mesh_audit", owner_name:$o}}')" >/dev/null \
      || die "could not create provider_mesh_audit"
  else
    log "database provider_mesh_audit already exists"
  fi

  # Force verified TLS on every connection this script makes.
  ENDPOINT_HOST="$(host_of "$OWNER_DOMAIN_URL")"
  DOMAIN_ADMIN_URL="$(with_db "$OWNER_DOMAIN_URL" provider_mesh       "sslmode=verify-full&sslrootcert=system")"
  AUDIT_ADMIN_URL="$(with_db  "$OWNER_DOMAIN_URL" provider_mesh_audit "sslmode=verify-full&sslrootcert=system")"
  unset NEON_API_KEY
fi

# ---------- target: container ----------
if [[ "$TARGET" == "container" ]]; then
  log "container target: environment=$ENVIRONMENT"
  ENDPOINT_HOST="$(host_of "$ADMIN_URL")"
  # Keep a non-default port so the printed URLs reach the same server the script did.
  ADMIN_PORT="$(echo "${ADMIN_URL%%\?*}" | sed -nE 's#^postgres(ql)?://([^@/]+@)?[^/:]+:([0-9]+).*#\3#p')"
  [[ -n "$ADMIN_PORT" && "$ADMIN_PORT" != "5432" ]] && ENDPOINT_HOST="$ENDPOINT_HOST:$ADMIN_PORT"
  for db in provider_mesh provider_mesh_audit; do
    if [[ "$(psql "$ADMIN_URL" -Atqc "SELECT 1 FROM pg_database WHERE datname='$db'")" != "1" ]]; then
      log "creating database $db"
      psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -qc "CREATE DATABASE $db" >/dev/null
    fi
  done
  DOMAIN_ADMIN_URL="$(with_db "$ADMIN_URL" provider_mesh)"
  AUDIT_ADMIN_URL="$(with_db  "$ADMIN_URL" provider_mesh_audit)"
  PROJECT_ID="(container)"; BRANCH_ID="(container)"
fi

# ---------- roles, grants, marker (same SQL for both targets) ----------
log "applying sql/01_roles.sql"
psql "$DOMAIN_ADMIN_URL" -v ON_ERROR_STOP=1 -q \
  -v mesh_migrate_pw="$PW_MIGRATE" -v mesh_app_pw="$PW_APP" \
  -v mesh_audit_writer_pw="$PW_AUDIT_W" -v mesh_audit_reader_pw="$PW_AUDIT_R" \
  -f "$SQL_DIR/01_roles.sql"

log "applying sql/02_domain_db.sql"
psql "$DOMAIN_ADMIN_URL" -v ON_ERROR_STOP=1 -q \
  -v instance_id="$INSTANCE_ID" -v environment="$ENVIRONMENT" -f "$SQL_DIR/02_domain_db.sql"

log "applying sql/03_audit_db.sql"
psql "$AUDIT_ADMIN_URL" -v ON_ERROR_STOP=1 -q \
  -v instance_id="$INSTANCE_ID" -v environment="$ENVIRONMENT" -f "$SQL_DIR/03_audit_db.sql"

# ---------- verification (read-only) ----------
log "verifying"
CHECK="$(psql "$DOMAIN_ADMIN_URL" -Atq <<'SQL'
SELECT string_agg(rolname || ':' || CASE WHEN rolbypassrls THEN 'BYPASSRLS' ELSE 'nobypassrls' END, ',' ORDER BY rolname)
FROM pg_roles WHERE rolname IN ('mesh_migrate','mesh_app','mesh_audit_writer','mesh_audit_reader');
SQL
)"
[[ "$CHECK" == "mesh_app:nobypassrls,mesh_audit_reader:nobypassrls,mesh_audit_writer:nobypassrls,mesh_migrate:nobypassrls" ]] || die "role attributes unexpected: $CHECK"
APP_CAN_CONNECT_AUDIT="$(psql "$AUDIT_ADMIN_URL" -Atqc "SELECT has_database_privilege('mesh_app','provider_mesh_audit','CONNECT')")"
[[ "$APP_CAN_CONNECT_AUDIT" == "f" ]] || die "mesh_app can CONNECT to the audit database; isolation failed"
MARK_D="$(psql "$DOMAIN_ADMIN_URL" -Atqc "SELECT instance_id||'/'||environment FROM mesh_instance")"
MARK_A="$(psql "$AUDIT_ADMIN_URL"  -Atqc "SELECT instance_id||'/'||environment FROM mesh_instance")"
[[ "$MARK_D" == "$INSTANCE_ID/$ENVIRONMENT" && "$MARK_A" == "$INSTANCE_ID/$ENVIRONMENT" ]] || die "marker mismatch: domain=$MARK_D audit=$MARK_A"

# ---------- output ----------
SSL="?sslmode=verify-full&sslrootcert=system"
[[ "$TARGET" == "container" ]] && SSL=""
cat <<EOF

================ PROVISIONING COMPLETE — RECORD IN docs/infrastructure/ENVIRONMENTS.md ================
environment        : $ENVIRONMENT
target             : $TARGET
project            : $PROJECT_NAME ($PROJECT_ID)   branch: $BRANCH_ID
region             : $REGION
postgres major     : $PG_VERSION
endpoint host      : $ENDPOINT_HOST
instance_id        : $INSTANCE_ID
databases          : provider_mesh (domain), provider_mesh_audit (audit)
roles              : mesh_migrate, mesh_app (NOBYPASSRLS), mesh_audit_writer, mesh_audit_reader
run date (UTC)     : $(date -u +%Y-%m-%dT%H:%M:%SZ)
verification       : role attributes OK; mesh_app cannot connect to audit DB; markers match in both DBs

================ SECRETS — enter by NAME into Replit Secrets, then close this window ================
(Values are shown ONCE. They are not written anywhere by this script.)

PROVIDER_MESH_INSTANCE_ID=$INSTANCE_ID
PROVIDER_MESH_ENVIRONMENT=$ENVIRONMENT
PROVIDER_MESH_DATABASE_URL=postgresql://mesh_app:${PW_APP}@${ENDPOINT_HOST}/provider_mesh${SSL}
PROVIDER_MESH_AUDIT_URL=postgresql://mesh_audit_writer:${PW_AUDIT_W}@${ENDPOINT_HOST}/provider_mesh_audit${SSL}
PROVIDER_MESH_MIGRATE_URL=postgresql://mesh_migrate:${PW_MIGRATE}@${ENDPOINT_HOST}/provider_mesh${SSL}
PROVIDER_MESH_AUDIT_MIGRATE_URL=postgresql://mesh_migrate:${PW_MIGRATE}@${ENDPOINT_HOST}/provider_mesh_audit${SSL}
PROVIDER_MESH_AUDIT_READER_URL=postgresql://mesh_audit_reader:${PW_AUDIT_R}@${ENDPOINT_HOST}/provider_mesh_audit${SSL}

Do NOT create a Replit database for this workspace; DATABASE_URL must never exist here (ADR-001 §6.3 rule 8).
EOF
