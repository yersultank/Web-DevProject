#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_CMD="cd '$ROOT_DIR' && ./scripts/start-backend.sh"
FRONTEND_CMD="cd '$ROOT_DIR' && ./scripts/start-frontend.sh"

echo "Trying to launch backend and frontend in separate terminal windows..."

if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -lc "$BACKEND_CMD; exec bash"
  gnome-terminal -- bash -lc "$FRONTEND_CMD; exec bash"
  exit 0
fi

if command -v x-terminal-emulator >/dev/null 2>&1; then
  x-terminal-emulator -e bash -lc "$BACKEND_CMD; exec bash" &
  x-terminal-emulator -e bash -lc "$FRONTEND_CMD; exec bash" &
  wait
  exit 0
fi

if command -v konsole >/dev/null 2>&1; then
  konsole -e bash -lc "$BACKEND_CMD; exec bash" &
  konsole -e bash -lc "$FRONTEND_CMD; exec bash" &
  wait
  exit 0
fi

echo "No supported terminal launcher found."
echo "Run these in two separate terminals:"
echo "  ./scripts/start-backend.sh"
echo "  ./scripts/start-frontend.sh"
