#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-23100}"

# NOTE: DATABASE_URL should be provided via .env.local or environment.
# Example: file:/path/to/persistent/prod.db

pnpm start -p "$PORT"
