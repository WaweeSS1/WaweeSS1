#!/usr/bin/env bash
set -euo pipefail

# Dispatch to the requested monorepo service. Defaults to the API.
SERVICE="${SERVICE:-api}"

# Run pending Prisma migrations once, only from the API service, to avoid
# three services racing on the same database at boot.
if [[ "$SERVICE" == "api" ]]; then
  echo "[entrypoint] applying database migrations..."
  ( cd packages/db && npx prisma migrate deploy ) || echo "[entrypoint] migrate deploy skipped/failed (continuing)"
fi

case "$SERVICE" in
  api)         exec node services/api/dist/index.js ;;
  bot)         exec node services/bot/dist/index.js ;;
  broker-sync) exec node services/broker-sync/dist/index.js ;;
  *) echo "[entrypoint] unknown SERVICE='$SERVICE' (expected api|bot|broker-sync)"; exit 1 ;;
esac
