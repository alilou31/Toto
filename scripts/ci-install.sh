#!/usr/bin/env bash
# GitHub Actions npm install: retry transient registry failures, never hide real dependency failures.
set -euo pipefail

max_attempts="${CI_NPM_MAX_ATTEMPTS:-3}"
retry_delay="${CI_NPM_RETRY_DELAY_SECONDS:-8}"
if ! [[ "$max_attempts" =~ ^[1-3]$ && "$retry_delay" =~ ^[0-9]+$ ]]; then
  echo "Invalid CI npm retry configuration" >&2
  exit 2
fi

log_file="$(mktemp)"
trap 'rm -f "$log_file"' EXIT

for ((attempt=1; attempt<=max_attempts; attempt++)); do
  : > "$log_file"
  echo "npm install attempt ${attempt}/${max_attempts}"
  if npm install --no-audit --no-fund --prefer-offline \
      --fetch-timeout=30000 --fetch-retries=2 --fetch-retry-factor=2 \
      --fetch-retry-mintimeout=5000 --fetch-retry-maxtimeout=30000 \
      2>&1 | tee "$log_file"; then
    exit 0
  fi
  if ! grep -Eq 'npm (error code|ERR!) (EIDLETIMEOUT|ETIMEDOUT|ECONNRESET|EAI_AGAIN|ENOTFOUND|ECONNREFUSED)' "$log_file"; then
    echo "Non-network npm failure: not retrying" >&2
    exit 1
  fi
  if ((attempt == max_attempts)); then
    echo "Transient npm registry error persists after ${max_attempts} attempts" >&2
    exit 1
  fi
  echo "Transient npm registry error: retrying after ${retry_delay}s" >&2
  sleep "$retry_delay"
done
