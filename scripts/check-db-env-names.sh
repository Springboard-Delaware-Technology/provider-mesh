#!/usr/bin/env bash
# Foundation 001 A08 / ADR-001 §6.3 rule 8 — repository-wide static check.
#
# The application reads its database connection from PROVIDER_MESH_DATABASE_URL and nothing
# else. This check fails if any code or configuration path references a platform-injected
# database variable. It runs in CI on every push.
#
# Scope: code and configuration paths. Excluded, with the reason for each:
#   - this script (the spec exempts the check itself);
#   - docs/**, replit.md, CLAUDE.md, LICENSE: protected documents, not code (replit.md §10);
#   - scripts/provision/**: the provisioning procedure prints the prohibition as operator
#     guidance ("DATABASE_URL must never exist here") and reads no variable.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PATTERN='DATABASE_URL|PGHOST|PGDATABASE|PGUSER|PGPASSWORD|PGPORT'
INCLUDE=(src db tests scripts .github package.json .replit .env.example tsconfig.json tsconfig.build.json eslint.config.js vitest.config.ts .dependency-cruiser.cjs)

existing=()
for p in "${INCLUDE[@]}"; do [[ -e "$p" ]] && existing+=("$p"); done

# PROVIDER_MESH_DATABASE_URL contains DATABASE_URL as a substring; require a non-word boundary.
if hits="$(grep -rnE "(^|[^A-Za-z0-9_])(${PATTERN})" "${existing[@]}" \
      --exclude-dir=node_modules --exclude-dir=provision \
      --exclude=check-db-env-names.sh 2>/dev/null)"; then
  echo "A08 violation: platform-injected database variable referenced:" >&2
  echo "$hits" >&2
  exit 1
fi
echo "check-db-env-names: no reference to a platform-injected database variable"
