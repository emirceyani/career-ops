#!/bin/bash
# Daily scan wrapper. Invoked by launchd at 08:00 local.
# Runs zero-token scan.mjs, logs result, captures count for digest.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

LOG="$REPO/data/automation-log.tsv"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
HISTORY_BEFORE=$(wc -l < "$REPO/data/scan-history.tsv" 2>/dev/null | tr -d ' ' || echo 0)

# Source .env if present (for any env-driven config)
if [[ -f "$REPO/.env" ]]; then
  set -a; source "$REPO/.env"; set +a
fi

# Resolve node from common locations (launchd has minimal PATH)
NODE="$(command -v node || echo /opt/homebrew/bin/node)"
if [[ ! -x "$NODE" ]]; then
  NODE="/usr/local/bin/node"
fi
if [[ ! -x "$NODE" ]]; then
  echo -e "${TS}\tscan\terror\t0\tnode not found in PATH" >> "$LOG"
  exit 1
fi

if "$NODE" "$REPO/scan.mjs" > "$REPO/data/last-scan-output.log" 2>&1; then
  HISTORY_AFTER=$(wc -l < "$REPO/data/scan-history.tsv" 2>/dev/null | tr -d ' ' || echo 0)
  ADDED=$((HISTORY_AFTER - HISTORY_BEFORE))
  echo -e "${TS}\tscan\tok\t${ADDED}\t${ADDED} new entries in scan-history" >> "$LOG"
else
  EXIT=$?
  TAIL=$(tail -1 "$REPO/data/last-scan-output.log" 2>/dev/null | tr '\t\n' '  ' | cut -c1-160)
  echo -e "${TS}\tscan\terror\t0\texit=${EXIT} ${TAIL}" >> "$LOG"
  exit $EXIT
fi
