#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-23100}"

echo "[02_contact_us] cleaning orphan listeners on :${PORT} ..."
if command -v lsof >/dev/null 2>&1; then
  lsof -ti:${PORT} | xargs -r kill -9 || true
fi

# NOTE: DATABASE_URL should be provided via .env.local or environment.
# Example: file:/path/to/persistent/prod.db

exec pnpm start -p "$PORT"