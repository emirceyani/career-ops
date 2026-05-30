#!/bin/bash
# Digest wrapper. Invoked by launchd daily at 09:30 local.

set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"

NODE="$(command -v node || echo /opt/homebrew/bin/node)"
if [[ ! -x "$NODE" ]]; then NODE="/usr/local/bin/node"; fi

"$NODE" "$REPO/scripts/automation/send-digest.mjs"
