#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

cd "$BACKEND_DIR"

PYTHON_BIN="/bin/python"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python3"
fi

echo "Running migrations..."
"$PYTHON_BIN" manage.py migrate --skip-checks

echo "Seeding users/assets with admin/pass1234..."
"$PYTHON_BIN" manage.py seed_demo_data --users 3 --assets 24 --admin-username admin --user-prefix user --password pass1234

echo "Seed complete."
