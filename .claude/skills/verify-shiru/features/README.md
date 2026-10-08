# Shiru verification map

This folder is the maintained source for verifying shiru's user-facing behavior. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `.claude/skills/verify-shiru/scripts/launch.sh` from the repo root. It refuses to start when ports 3000 or 3001 are taken.
- `doctor.sh` exits 0 before any drive.
- Sign-up and checkout need a real Polar sandbox `POLAR_ACCESS_TOKEN` in `apps/api/.env`. Without it, launch with `VERIFY_PLACEHOLDER_SECRETS=1` and report those paths as blocked.
- Use a fresh email per run, such as `verify-$RUN_ID@example.com`. The local D1 is shared with the user's dev server and keeps every user ever created.

## Driving conventions

- Prefer the dashboard. Use the API directly only for features that have no UI, and say so.
- Use the stable handles: input ids `#name`, `#email`, `#password`, and exact button labels.
- Send `Origin: http://localhost:3001` on every API request, and keep cookies in `$RUN/jar`.
- Capture emails with `latest-email.sh` before cleanup. The dev server deletes them when it stops.

## Proof and skip reporting

- Each feature gets its own folder under `evidence/` named after its feature id.
- UI proof is a screenshot before and after the action, plus `steps.log` and `browser-console.log`.
- API proof is the request and the full response body, saved to a file.
- A change to stored state is proven by a second, read-only view (session, oRPC read, email file).
- Report anything not driven with the command attempted and the precondition that was missing.

## Feature entry contract

Each feature file starts with an H1 and one paragraph on what the user sees, then exactly these H2 sections in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify-shiru`, `Gotchas`.

## Features

- [API status](./api-status.md) covers the home page's live API check and the browser CORS path it depends on.
- [Accounts and email verification](./accounts.md) covers sign-up, the verification email and link, sign-in, protected pages and sign-out.
- [Organizations and trials](./organizations-and-trials.md) covers creating and switching organizations and the one-trial-per-user rule.
- [Billing and paid access](./billing.md) covers the dashboard plan panel, checkout and the paid procedure level.
