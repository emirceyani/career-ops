#!/bin/bash
# Uninstall career-ops launchd agents. Safe to re-run.

set -euo pipefail

AGENTS_DIR="$HOME/Library/LaunchAgents"
LABELS=("com.careerops.scan" "com.careerops.pipeline" "com.careerops.digest")

for LABEL in "${LABELS[@]}"; do
  DST="$AGENTS_DIR/${LABEL}.plist"
  if [[ -f "$DST" ]]; then
    launchctl unload "$DST" 2>/dev/null || true
    rm "$DST"
    echo "✓ Removed $LABEL"
  else
    echo "  $LABEL (not installed)"
  fi
done

echo ""
echo "Uninstalled. Repo files untouched — re-run install.sh to reactivate."
