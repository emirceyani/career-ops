#!/bin/bash
# Pipeline wrapper. Invoked by launchd Mon+Thu at 09:00 local.
# Pre-checks backpressure, then runs `claude -p` in headless mode with the
# pipeline mode and --max 15 cap. Drafts (outreach, apply) are generated as
# part of the pipeline mode itself when reports score >= 4.0.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

LOG="$REPO/data/automation-log.tsv"
PIPELINE="$REPO/data/pipeline.md"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
MAX_JOBS=15
BACKPRESSURE_CAP=50

if [[ -f "$REPO/.env" ]]; then
  set -a; source "$REPO/.env"; set +a
fi

# Backpressure: if pending queue exceeds cap, skip this run
PENDING=$(grep -c '^- \[ \]' "$PIPELINE" 2>/dev/null || echo 0)
if (( PENDING > BACKPRESSURE_CAP )); then
  echo -e "${TS}\tpipeline\tskipped_backpressure\t0\t${PENDING} pending > ${BACKPRESSURE_CAP} cap" >> "$LOG"
  exit 0
fi
if (( PENDING == 0 )); then
  echo -e "${TS}\tpipeline\tskipped_empty\t0\tno pending URLs" >> "$LOG"
  exit 0
fi

CLAUDE="$(command -v claude || true)"
if [[ -z "$CLAUDE" || ! -x "$CLAUDE" ]]; then
  echo -e "${TS}\tpipeline\terror\t0\tclaude CLI not found in PATH" >> "$LOG"
  exit 1
fi

# Count reports before to measure what this run produced
REPORTS_BEFORE=$(ls "$REPO/reports/" 2>/dev/null | grep -c '\.md$' || echo 0)

# Headless invocation of pipeline mode with --max cap.
# Pipeline mode is documented in modes/pipeline.md; we let Claude drive it.
PROMPT="Run /career-ops pipeline --max ${MAX_JOBS}. For any report with score >= 4.0, also draft a LinkedIn recruiter outreach message (save to outreach/{company-slug}-$(date +%Y-%m-%d).md) and, if the JD has an application form, draft answers (save to apply-drafts/{company-slug}-$(date +%Y-%m-%d).md). Generate PDFs for reports with score >= 3.8. Never submit anything; never send anything. Exit when done."

if "$CLAUDE" -p "$PROMPT" > "$REPO/data/last-pipeline-output.log" 2>&1; then
  REPORTS_AFTER=$(ls "$REPO/reports/" 2>/dev/null | grep -c '\.md$' || echo 0)
  NEW_REPORTS=$((REPORTS_AFTER - REPORTS_BEFORE))
  echo -e "${TS}\tpipeline\tok\t${NEW_REPORTS}\tprocessed up to ${MAX_JOBS}, ${NEW_REPORTS} new reports" >> "$LOG"
else
  EXIT=$?
  TAIL=$(tail -1 "$REPO/data/last-pipeline-output.log" 2>/dev/null | tr '\t\n' '  ' | cut -c1-160)
  echo -e "${TS}\tpipeline\terror\t0\texit=${EXIT} ${TAIL}" >> "$LOG"
  exit $EXIT
fi
