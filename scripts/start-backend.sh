#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT_DIR/.venv-1/bin/activate" ]]; then
  # Prefer the currently used venv for this project.
  source "$ROOT_DIR/.venv-1/bin/activate"
elif [[ -f "$ROOT_DIR/.venv/bin/activate" ]]; then
  source "$ROOT_DIR/.venv/bin/activate"
fi

cd "$ROOT_DIR/backend"

echo "Starting Django backend on http://127.0.0.1:8000"
PYTHON_BIN="python"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python3"
fi

"$PYTHON_BIN" manage.py runserver 127.0.0.1:8000
