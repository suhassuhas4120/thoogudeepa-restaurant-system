#!/bin/bash
# -----------------------------------------------------------------------------
# Database Backup Script for Thoogudeepa POS
# Performs timestamped pg_dump, gzips the dump, and prunes files older than 30 days
# -----------------------------------------------------------------------------

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/thoogudeepa}"
DB_NAME="${POSTGRES_DB:-thoogudeepa_pos}"
DB_USER="${POSTGRES_USER:-thoogudeepa_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting automated database backup for ${DB_NAME}..."

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  | gzip > "${FILENAME}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created successfully: ${FILENAME} ($(du -h "${FILENAME}" | cut -f1))"

# Retention: Delete backups older than 30 days
find "${BACKUP_DIR}" -name "${DB_NAME}_backup_*.sql.gz" -mtime +30 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Retention check complete. Backups older than 30 days removed."
