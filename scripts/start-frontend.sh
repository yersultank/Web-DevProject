#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$FRONTEND_DIR"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found. Installing frontend dependencies..."
  npm install
fi

echo "Starting Angular frontend on http://127.0.0.1:4200"
npm run start
