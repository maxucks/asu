#!/bin/sh
set -e
cd /app
if [ -n "$DATABASE_URL" ] && [ ! -f "$DATABASE_URL" ]; then
  echo "Database missing at $DATABASE_URL — running db:setup"
  bun run db:setup
fi
exec bun run start