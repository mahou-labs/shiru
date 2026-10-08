# API status

The dashboard home page shows whether the browser can reach the API. It calls the public `healthCheck` procedure from the dashboard origin, so a passing check also proves the API's CORS setup works from a real browser.

## Sub-features

- `api-status-connected` shows `API Status` with `Connected` and a green dot.
- `api-status-disconnected` shows `Disconnected` and a red dot when the API cannot be reached.
- `api-status-cors` lets a credentialed request from `http://localhost:3001` through to the API.

## How to get to it (user POV)

- Open `http://localhost:3001/`.
- Choose `Home` in the header from any page.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0. Placeholder secrets are fine.

- **Connected.** Open the home page and wait for the check. Run `node .claude/skills/verify-shiru/scripts/browser.mjs .claude/skills/verify-shiru/steps/api-status.mjs "$(cat .verify/current)/evidence/api-status"`. It prints `PASS`, and `home-connected.png` shows `API Status` with `Connected`.
- **CORS.** Read `browser-console.log` in the same evidence folder. It contains no `[network.failed]` line for `localhost:3000`.
- **Raw check.** Run `curl -s -X POST -H 'content-type: application/json' -d '{}' http://localhost:3000/rpc/healthCheck`. The body is `{"json":"OK"}`.

## Gotchas

- The page shows `Checking...` first. Wait for `Connected`; do not screenshot the first paint as proof.
- `curl` ignores CORS. Only the browser run proves `api-status-cors`.
- `browser-console.log` always has a React warning about a script tag inside a component. It is unrelated to this feature.
- `api-status-disconnected` needs the API stopped while the dashboard runs. `launch.sh` starts both together, so drive it only if you can stop the API on its own, and report it as skipped otherwise.
