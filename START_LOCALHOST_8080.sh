#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PORT=8080
npm run local
