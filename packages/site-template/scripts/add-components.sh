#!/usr/bin/env bash
# Adds every Nimbus registry component and utility to the template, and records each in nimbus.json.
# `vp run components --overwrite` replaces existing files with the registry's current versions.
# Features (`list --type feature`) are agent hand-offs that edit the project, so they are left out.
set -euo pipefail

cd "$(dirname "$0")/.."
for type in ui lib; do
  for slug in $(vp exec nimbus-docs list --type "$type" | awk '/^    [a-z0-9]/ { print $1 }'); do
    vp exec nimbus-docs add "$slug" --yes "$@"
  done
done
