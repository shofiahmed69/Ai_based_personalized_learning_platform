#!/usr/bin/env bash
# Run schema against the database. Uses DATABASE_URL from .env.
set -e
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  echo "No .env file. Copy .env.example to .env and set DATABASE_URL."
  exit 1
fi
# Read DATABASE_URL (avoid sourcing whole .env)
DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set in .env"
  exit 1
fi
echo "Running schema against database..."
psql "$DATABASE_URL" -f schema.sql
echo "Schema applied successfully."
