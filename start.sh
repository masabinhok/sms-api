#!/bin/sh
set -e

echo "Starting container: running Prisma migrations (if any)..."
for f in apps/*/prisma/schema.prisma; do
  if [ -f "$f" ]; then
    echo "--> Running migrations for $f"
    npx prisma migrate deploy --schema="$f" || true
  fi
done

echo "Starting gateway server"
exec node dist/apps/gateway/main.js
