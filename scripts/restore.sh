#!/usr/bin/env bash
set -euo pipefail
pg_restore -d "$DATABASE_URL" "$1"
