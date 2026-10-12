---
name: verify-shiru
description: Launch and drive the shiru dashboard (React, http://localhost:3001) and API (Hono + oRPC + Better Auth on Workers, http://localhost:3000) the way a user does, and capture evidence. Use when proving a change to sign-up, email verification, sign-in, organizations, trials, billing, CORS, or any dashboard page actually works, not just that it type checks.
---

# Verify shiru

Shiru is two apps started together by `vp run dev`: the dashboard at `http://localhost:3001` and the API at `http://localhost:3000`. Users touch the dashboard. The API is also reachable over HTTP, which is the fastest way to seed state (extra organizations, members) before driving the UI. All helpers live in `.claude/skills/verify-shiru/scripts/`. Run them from the repo root.

Read `features/README.md` before driving anything. Each feature file there is the recipe for one user-facing feature.

## Launch

```bash
.claude/skills/verify-shiru/scripts/launch.sh
```

- Starts `vp run dev` in its own session and waits until `GET :3000/` returns `OK` and `GET :3001/` returns 200. It prints `ready: ...` and the run directory.
- Each run gets `.verify/runs/<RUN_ID>/` (gitignored) with `dev.log`, `pgid` and `evidence/`. Set `RUN_ID=<name>` to choose the name. `.verify/current` points at the active run.
- It refuses to start if port 3000 or 3001 is already in use. That is usually the user's own dev server. Never stop it, and never drive it. Ask the user to stop it, or verify later.
- The API's `dev` script runs `varlock load` first. If `apps/api/.env` is missing a required value, launch fails and the log names it. For flows that never reach Polar (home page, CORS, email resend, sign-in of existing users, organizations), use `VERIFY_PLACEHOLDER_SECRETS=1 launch.sh`. It fills an empty `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` with placeholders. Sign-up and checkout then fail at Polar, so they cannot be verified in that mode. Report them as blocked, never as passing.

## Doctor

```bash
.claude/skills/verify-shiru/scripts/doctor.sh
```

Read-only. Checks that the run's session is alive, that ports 3000 and 3001 belong to that session, that the API answers `OK`, that the dashboard answers 200, and that a preflight from the dashboard origin gets `access-control-allow-credentials: true`. It also notes placeholder secrets. Run it first whenever anything looks off. Exit code 0 means the instance is worth driving.

## Drive

**Browser.** `browser.mjs` drives headless Chromium over the DevTools Protocol, with no dependencies:

```bash
node .claude/skills/verify-shiru/scripts/browser.mjs <steps.mjs> "$(cat .verify/current)/evidence/<feature-id>"
```

`<steps.mjs>` default-exports `async (page) => { ... }`. The `page` API:

- `goto(url)`, `url()`, `text()` (the page's visible text), `evaluate(js)`.
- `waitForText(text, timeoutMs?)`, `waitForUrl(fragment, timeoutMs?)`. Both throw on timeout.
- `fill(selector, value)` sets an input so React sees the change. Select form fields by name: `[name=email]`, `[name=password]`.
- `clickButton(label)` clicks the first button, link, menu item or select option whose visible text is exactly `label`, such as `Sign up` or `Sign out`. Submit forms with `click("form button[type=submit]")`.
- `click(selector)` clicks the first element matching a CSS selector.
- `press(selector)` clicks it with real mouse events. Use it for Base UI menu and select triggers, which `click()` does not open.
- `screenshot(file)` saves a PNG into the evidence folder. `log(line)` appends to `steps.log`.

A thrown error makes the run exit 1, write `FAIL <reason>` to `steps.log` and save `failure.png`. Browser console messages, uncaught exceptions and failed network requests (including CORS failures) always go to `browser-console.log`. Ready-made steps files are in `steps/`.

**API.** Use curl with a cookie jar in the run folder and the dashboard's `Origin` header. Better Auth rejects auth `POST`s without a trusted origin.

```bash
RUN=$(cat .verify/current); H=(-H 'content-type: application/json' -H 'Origin: http://localhost:3001')
curl -s -c "$RUN/jar" -b "$RUN/jar" "${H[@]}" -X POST -d '{"email":"…","password":"…"}' http://localhost:3000/auth/sign-in/email
curl -s -c "$RUN/jar" -b "$RUN/jar" "${H[@]}" -X POST -d '{}' http://localhost:3000/rpc/privateData
```

Auth routes are under `/auth/*` (Better Auth). Procedures are `POST /rpc/<name>` with body `{"json": <input>}`, or `{}` for no input. Typed errors come back as `{"json":{"defined":true,"code":"…","status":…}}`.

**Email.** Emails are simulated in development. `latest-email.sh [recipient]` finds the newest one in the run's `dev.log`, copies its text and HTML into `evidence/emails/` and prints the first `/auth/` link. The files are deleted when the dev server stops, so capture them before cleanup.

## Evidence

- Everything goes in `.verify/runs/<RUN_ID>/evidence/<feature-id>/`. It survives cleanup.
- Drive the real user path: dashboard forms, the emailed link, public routes. Do not call internal functions, edit the database, or add test-only routes as proof. If you must add a temporary route to reach a state, say so in the report and remove it before finishing.
- Capture the action and the resulting state: a screenshot before and after, plus a second, read-only view of what changed (the session from `GET /auth/get-session`, or an oRPC read).
- Check side effects, not just the screen: the email file for sign-up, the session cookie for sign-in, the access result for trials.
- Report exactly what was skipped and why. A path that failed under placeholder secrets was not verified.

## Cleanup

```bash
.claude/skills/verify-shiru/scripts/cleanup.sh
```

Stops only the session this run started (by its process group), then confirms ports 3000 and 3001 are free. If another process still holds a port, it reports the pid and leaves it alone. Run folders and evidence are kept. Delete old ones in `.verify/runs/` by hand when they are no longer needed. Test users and organizations stay in the local D1 (`apps/api/.cloudflare/state`), which is the same database the user's own dev server uses. Use unique emails such as `verify-<RUN_ID>@mailinator.com`. The Polar sandbox rejects `@example.com` addresses at sign-up.

## Helpers

- `scripts/launch.sh` starts the apps and waits until both answer.
- `scripts/doctor.sh` is the read-only health check.
- `scripts/browser.mjs <steps.mjs> <evidence-dir>` drives Chromium.
- `scripts/latest-email.sh [recipient]` captures the newest email and its link.
- `scripts/cleanup.sh` stops what launch started.
- `steps/*.mjs` are ready-to-run browser recipes named after feature ids.
