#!/usr/bin/env bash
# Mirrors .github/workflows/ci.yml so an agent runs exactly what CI runs.
# Keep the two in sync: a change to one belongs in the same PR as the other.
#
#   .agent/verify.sh           typecheck + lint + tests   (the definition of done)
#   .agent/verify.sh --fast    typecheck + tests          (inner loop while iterating)
#   .agent/verify.sh --full    typecheck + lint + tests + build
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

MODE=default
case "${1:-}" in
  --fast) MODE=fast ;;
  --full) MODE=full ;;
esac

FAILED=(); PASSED=()
run() { # run <label> <command...>
  local label="$1"; shift
  printf '\n── %s ──────────────────────────────────────\n' "$label"
  if "$@"; then PASSED+=("ok   $label"); else FAILED+=("FAIL $label"); fi
}

if [ ! -d node_modules ]; then
  echo "VERIFY: no node_modules — run 'npm ci' first."
  echo "        (npm ci, not npm install: it installs exactly the lockfile and fails if"
  echo "         package.json and package-lock.json disagree, which is one of the three"
  echo "         things that has actually broken this project.)"
  exit 2
fi

[ "$MODE" = "fast" ] || run "typecheck" npm run --silent typecheck
[ "$MODE" = "fast" ] || run "lint"      npm run --silent lint
run "unit tests" npm test --silent
[ "$MODE" = "full" ] && run "build" npm run build

printf '\n════════════════════════════════════════════\n'
for r in "${PASSED[@]}"; do echo "  $r"; done
for f in "${FAILED[@]}"; do echo "  $f"; done
if [ ${#FAILED[@]} -gt 0 ]; then echo "VERIFY: FAIL"; exit 1; fi
echo "VERIFY: PASS"
