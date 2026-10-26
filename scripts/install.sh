#!/usr/bin/env bash
# Linux / macOS installer for the United Nations skin.
#   ./scripts/install.sh                 # desktop profile if present, else web
#   ./scripts/install.sh --profile web
#   ./scripts/install.sh --dry-run
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
command -v node >/dev/null 2>&1 || { echo "Node 22+ is required (it ships with DeepSeek Harness)"; exit 1; }
exec node "$DIR/install.mjs" "$@"
