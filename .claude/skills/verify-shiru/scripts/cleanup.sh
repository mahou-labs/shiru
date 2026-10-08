#!/usr/bin/env bash
# Stops the processes this run started. Keeps .verify/runs/<id>/ (logs and evidence).
set -uo pipefail
ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
RUN_DIR=$(cat "$ROOT/.verify/current" 2>/dev/null || true)
[ -z "$RUN_DIR" ] && { echo "no current run"; exit 0; }
PGID=$(cat "$RUN_DIR/pgid")
kill -TERM -- "-$PGID" 2>/dev/null
for _ in $(seq 1 10); do kill -0 -- "-$PGID" 2>/dev/null || break; sleep 1; done
kill -KILL -- "-$PGID" 2>/dev/null
rm -f "$ROOT/.verify/current"
for port in 3000 3001; do
  if ss -ltnH "sport = :$port" | grep -q .; then
    echo "port $port is still in use by a process outside session $PGID; not killing it: $(ss -ltnpH "sport = :$port" | grep -o 'pid=[0-9]*' | head -1)" >&2
  fi
done
echo "stopped session $PGID. Evidence kept in $RUN_DIR"
