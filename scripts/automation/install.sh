#!/bin/bash
# Install career-ops automation as launchd user agents (Mac only).
# Idempotent: re-running unloads any existing jobs and reloads fresh.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$AGENTS_DIR"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "✗ This installer is macOS-only. For Linux, set up cron instead."
  exit 1
fi

# Sanity checks
if [[ ! -x "$REPO/scripts/automation/daily-scan.sh" ]]; then
  chmod +x "$REPO/scripts/automation/"*.sh
fi
if ! command -v node >/dev/null 2>&1; then
  echo "✗ node not in PATH. Install Node.js first."
  exit 1
fi
if ! command -v claude >/dev/null 2>&1; then
  echo "⚠ claude CLI not in PATH. Pipeline routine will fail until installed."
fi

if [[ ! -f "$REPO/.env" ]]; then
  echo "⚠ .env not found. Email digest will skip until you create it."
  echo "  cp .env.example .env  # then fill in SMTP_* vars"
fi

# Check nodemailer is installed
if ! node -e "import('nodemailer').then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null; then
  echo "Installing nodemailer..."
  (cd "$REPO" && npm install nodemailer)
fi

LABELS=("com.careerops.scan" "com.careerops.pipeline" "com.careerops.digest")

for LABEL in "${LABELS[@]}"; do
  SRC="$REPO/scripts/automation/${LABEL}.plist"
  DST="$AGENTS_DIR/${LABEL}.plist"

  # Substitute __REPO__ placeholder with actual path
  sed "s|__REPO__|$REPO|g" "$SRC" > "$DST"

  # Unload if already loaded (idempotent)
  launchctl unload "$DST" 2>/dev/null || true
  launchctl load "$DST"
  echo "✓ Loaded $LABEL"
done

echo ""
echo "Installed. Schedule:"
echo "  scan      — daily at 08:00"
echo "  pipeline  — Mon + Thu at 09:00"
echo "  digest    — daily at 09:30"
echo ""
echo "Health check anytime:"
echo "  node scripts/automation/verify-automation.mjs"
echo ""
echo "To uninstall:"
echo "  bash scripts/automation/uninstall.sh"
