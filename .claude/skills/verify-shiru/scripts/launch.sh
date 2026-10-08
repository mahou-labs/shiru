#!/usr/bin/env bash
# Starts the API (:3000) and dashboard (:3001) with `vp run dev` in a new session.
# Usage: launch.sh            (uses apps/api/.env as is)
#        VERIFY_PLACEHOLDER_SECRETS=1 launch.sh   (fills an empty POLAR_ACCESS_TOKEN / POLAR_WEBHOOK_SECRET with placeholders)
set -euo pipefail
ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
RUN_ID=${RUN_ID:-$(date +%Y%m%d-%H%M%S)}
RUN_DIR="$ROOT/.verify/runs/$RUN_ID"

for port in 3000 3001; do
  if ss -ltnH "sport = :$port" | grep -q .; then
    echo "port $port is already in use. Another dev server (maybe the user's) owns it; refusing to drive a shared instance." >&2
    exit 1
  fi
done

mkdir -p "$RUN_DIR/evidence"
if [ "${VERIFY_PLACEHOLDER_SECRETS:-}" = 1 ]; then
  export POLAR_ACCESS_TOKEN="${POLAR_ACCESS_TOKEN:-verify-placeholder-token}"
  export POLAR_WEBHOOK_SECRET="${POLAR_WEBHOOK_SECRET:-verify-placeholder-webhook-secret}"
  echo "placeholder Polar secrets in use: sign-up and checkout will fail at Polar" > "$RUN_DIR/PLACEHOLDER_SECRETS"
fi

cd "$ROOT"
setsid vp run dev > "$RUN_DIR/dev.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/pgid"
echo "$RUN_DIR" > "$ROOT/.verify/current"

for _ in $(seq 1 90); do
  if ! kill -0 "$(cat "$RUN_DIR/pgid")" 2>/dev/null; then
    echo "dev server exited during startup. Last log lines:" >&2
    tail -25 "$RUN_DIR/dev.log" >&2
    exit 1
  fi
  if [ "$(curl -s -m 2 http://localhost:3000/)" = "OK" ] && curl -s -m 2 -o /dev/null -w '%{http_code}' http://localhost:3001/ | grep -q 200; then
    echo "ready: api http://localhost:3000  dashboard http://localhost:3001  run $RUN_DIR"
    exit 0
  fi
  sleep 1
done
echo "timed out waiting for both apps. See $RUN_DIR/dev.log" >&2
exit 1
