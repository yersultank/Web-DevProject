#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="127.0.0.1"
PORT="8000"

if [[ -f "$ROOT_DIR/.venv-1/bin/activate" ]]; then
  # Prefer the currently used venv for this project.
  source "$ROOT_DIR/.venv-1/bin/activate"
elif [[ -f "$ROOT_DIR/.venv/bin/activate" ]]; then
  source "$ROOT_DIR/.venv/bin/activate"
fi

cd "$ROOT_DIR/backend"

port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$PORT" | tail -n +2 | grep -q LISTEN
    return $?
  fi

  return 1
}

if port_in_use; then
  echo "Backend port $PORT is already in use."
  echo "If Django is already running, open http://$HOST:$PORT and continue."
  echo "If this is unexpected, stop the process on port $PORT and retry."
  exit 0
fi

echo "Starting Django backend on http://$HOST:$PORT"
PYTHON_BIN="python"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python3"
fi

"$PYTHON_BIN" manage.py runserver "$HOST:$PORT"
