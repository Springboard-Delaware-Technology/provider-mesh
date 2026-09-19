#!/usr/bin/env bash
# Placeholder for a Foundation 001 §4.1 script whose capability has not landed yet.
# Exits non-zero so nothing can mistake the placeholder for the real mechanism.
set -euo pipefail
name="${1:?script name}"; cap="${2:?capability}"; ref="${3:-}"
printf '%s is not implemented yet: it arrives with Foundation 001 capability %s %s\n' "$name" "$cap" "$ref" >&2
exit 1
