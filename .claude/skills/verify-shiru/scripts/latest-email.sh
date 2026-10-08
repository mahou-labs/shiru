#!/usr/bin/env bash
# Finds the newest simulated email (optionally for one recipient) in the current run's dev log,
# copies its text and HTML bodies into <run>/evidence/emails/, and prints the first auth link.
# The dev server deletes these files when it stops, so run this while the instance is up.
# Usage: latest-email.sh [recipient]
set -euo pipefail
ROOT=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
RUN_DIR=$(cat "$ROOT/.verify/current")
TO=${1:-}
block=$(awk -v to="$TO" '/send_email binding called/{b=""; keep=1} keep{b=b $0 "\n"} /^HTML: /{ if (to=="" || index(b, "To: " to)) last=b; keep=0 } END{printf "%s", last}' "$RUN_DIR/dev.log")
[ -z "$block" ] && { echo "no email found${TO:+ for $TO}" >&2; exit 1; }
printf '%s\n' "$block"
txt=$(printf '%s\n' "$block" | sed -n 's/^Text: //p')
html=$(printf '%s\n' "$block" | sed -n 's/^HTML: //p')
if [ ! -f "$txt" ]; then
  echo "email files are gone: the dev server that sent them has stopped" >&2
  exit 1
fi
mkdir -p "$RUN_DIR/evidence/emails"
cp "$txt" "$html" "$RUN_DIR/evidence/emails/"
echo "saved: $RUN_DIR/evidence/emails/$(basename "$txt")"
echo "link: $(grep -o 'http://localhost:3000/auth/[^ )]*' "$txt" | head -1)"
