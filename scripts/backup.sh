#!/usr/bin/env bash
set -euo pipefail
mkdir -p backups
pg_dump "$DATABASE_URL" -Fc > "backups/db_$(date +%F_%H-%M).dump"
