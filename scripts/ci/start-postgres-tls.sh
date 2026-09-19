#!/usr/bin/env bash
# Foundation 001 §10 step 3 / §5.3 rule 2 — start the CI PostgreSQL container with TLS.
#
# CI must exercise the same verified-TLS path as development (invariant 6: no code path
# disables verification). A throwaway CA and a server certificate for localhost are generated
# per run; the container serves TLS with them; the application trusts the CA through
# NODE_EXTRA_CA_CERTS, which extends the runtime trust store and never weakens verification.
#
# Usage: scripts/ci/start-postgres-tls.sh <tls-dir> [<postgres-major>]
# Prints nothing but progress; the CA path is <tls-dir>/ca.crt.
set -euo pipefail
dir="${1:?tls directory}"; major="${2:-18}"
mkdir -p "$dir"; cd "$dir"
openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 1 -subj "/CN=provider-mesh-ci-ca" >/dev/null 2>&1
openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj "/CN=localhost" >/dev/null 2>&1
printf 'subjectAltName=DNS:localhost,IP:127.0.0.1\n' > san.cnf
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 1 -extfile san.cnf >/dev/null 2>&1
rm -f ca.key server.csr san.cnf
# The image runs postgres as uid 999; the key must be readable by that user only.
sudo chown 999:999 server.key server.crt; sudo chmod 600 server.key; chmod 644 ca.crt
docker run -d --name pm-postgres \
  -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432 \
  -v "$dir:/tls:ro" "postgres:${major}" \
  -c ssl=on -c ssl_cert_file=/tls/server.crt -c ssl_key_file=/tls/server.key >/dev/null
for _ in $(seq 1 30); do
  if docker exec pm-postgres pg_isready -U postgres -q 2>/dev/null; then
    echo "postgres ${major} with TLS is ready"; exit 0
  fi
  sleep 1
done
docker logs pm-postgres >&2 || true
echo "postgres did not become ready" >&2; exit 1
