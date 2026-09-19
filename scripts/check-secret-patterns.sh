#!/usr/bin/env bash
# Foundation 001 §10 step 7 — verify no file in the diff matches secret patterns.
# A second layer on top of GitHub push protection (§9 rule 5). Heuristic by design: it
# targets the credential shapes this repository could plausibly leak (database URLs with
# an embedded password, Neon/GitHub/Anthropic/AWS tokens, private keys).
#
# Usage: scripts/check-secret-patterns.sh [<base-ref>]
#        scripts/check-secret-patterns.sh --files <path>...
#   With a base ref, only files changed since it are scanned; without one (or with the
#   all-zero SHA a new branch push reports) every tracked file is scanned. --files scans the
#   named paths only (used by the self-test).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ "${1:-}" == "--files" ]]; then
  shift; files=("$@")
else
  base="${1:-}"
  if [[ -n "$base" && "$base" != "0000000000000000000000000000000000000000" ]] && git rev-parse -q --verify "$base^{commit}" >/dev/null; then
    mapfile -t files < <(git diff --name-only --diff-filter=ACMR "$base" HEAD)
  else
    mapfile -t files < <(git ls-files)
  fi
fi

PATTERNS=(
  'postgres(ql)?://[A-Za-z0-9_.-]+:[A-Za-z0-9%._~-]{12,}@'   # URL with an embedded password
  'npg_[A-Za-z0-9]{10,}'                                    # Neon role password
  'gh[pousr]_[A-Za-z0-9]{30,}'                              # GitHub token
  'github_pat_[A-Za-z0-9_]{30,}'
  'sk-ant-[A-Za-z0-9_-]{20,}'                               # Anthropic API key
  'AKIA[0-9A-Z]{16}'                                        # AWS access key id
  'xox[baprs]-[A-Za-z0-9-]{10,}'                            # Slack token
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
)

status=0
for f in "${files[@]}"; do
  [[ -f "$f" ]] || continue
  [[ "$f" == "scripts/check-secret-patterns.sh" ]] && continue
  for p in "${PATTERNS[@]}"; do
    if grep -nEq -e "$p" "$f"; then
      # Report file and line number only; never print the matching text.
      echo "secret-pattern match in $f (lines: $(grep -nE -e "$p" "$f" | cut -d: -f1 | tr '\n' ' '))" >&2
      status=1
    fi
  done
done
[[ $status -eq 0 ]] && echo "check-secret-patterns: ${#files[@]} file(s) scanned, no match"
exit $status
