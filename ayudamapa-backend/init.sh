#!/bin/bash
set -e

echo "=== Starting Ayudamapa Backend ==="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

if [ "$MIGRATE_ON_START" = "1" ]; then
  echo "=== Running migrations ==="
  # Use postgres superuser for migrations to create resilio_user and schema
  MIGRATION_DB_URL="postgresql://postgres:${POSTGRES_PASSWORD:-resilio_dev}@postgres:5432/${POSTGRES_DB:-resilio}"
  DATABASE_URL="$MIGRATION_DB_URL" npm run migrate
  echo "=== Migrations completed ==="
else
  echo "=== Skipping migrations (MIGRATE_ON_START not set) ==="
fi

echo "=== Starting server on port $PORT ==="
npm run dev
