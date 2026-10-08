#!/usr/bin/env bash
# Read-only check: is the current verification instance ours and healthy?
set -uo pipefail
ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
fail=0
check() { if eval "$2" >/dev/null 2>&1; then echo "ok    $1"; else echo "FAIL  $1"; fail=1; fi; }

RUN_DIR=$(cat "$ROOT/.verify/current" 2>/dev/null || true)
if [ -z "$RUN_DIR" ]; then echo "FAIL  no current run (.verify/current missing). Run launch.sh first."; exit 1; fi
PGID=$(cat "$RUN_DIR/pgid")
echo "run   $RUN_DIR"
check "dev session $PGID is alive" "kill -0 -$PGID"
for port in 3000 3001; do
  owner=$(ss -ltnpH "sport = :$port" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
  check "port $port owned by our session" "[ -n '$owner' ] && [ \"\$(ps -o sid= -p $owner | tr -d ' ')\" = '$PGID' ]"
done
check "api GET / returns OK" "[ \"\$(curl -s -m 3 http://localhost:3000/)\" = OK ]"
check "dashboard GET / returns 200" "curl -s -m 3 -o /dev/null -w '%{http_code}' http://localhost:3001/ | grep -q 200"
check "api CORS allows the dashboard origin" "curl -s -m 3 -i -X OPTIONS -H 'Origin: http://localhost:3001' -H 'Access-Control-Request-Method: POST' http://localhost:3000/rpc/healthCheck | grep -qi 'access-control-allow-credentials: true'"
[ -f "$RUN_DIR/PLACEHOLDER_SECRETS" ] && echo "note  $(cat "$RUN_DIR/PLACEHOLDER_SECRETS")"
exit $fail
