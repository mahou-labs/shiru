# Organizations and trials

Each user works inside an organization. A user's first organization gets a 30-day trial with no card. Any later organization starts without a trial, even if the first one was deleted. The dashboard shows the trial state of the active organization.

## Sub-features

- `orgs-none` shows `Create an organization to start your trial.` on `/dashboard` when the user has no organization.
- `orgs-first-trial` gives the first organization a trial ending 30 days after creation.
- `orgs-no-second-trial` gives later organizations no trial (`Your trial has ended`).
- `orgs-active-fallback` switches to another organization the user belongs to when the active one is deleted.
- `orgs-trial-not-settable` ignores a `trialEndsAt` sent by the client.

## How to get to it (user POV)

- There is no organization UI in the dashboard yet. Users can only create, switch and delete organizations through the API (`/auth/organization/*`), as the dashboard's auth client would.
- The result shows on `/dashboard`, below the welcome line: `Trial ends <date>` with an `Upgrade` button, or `Your trial has ended`.
- `POST /rpc/subscription` returns the active organization's access as JSON.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0. Placeholder secrets are fine.
- A signed-in, verified user with cookies in `$RUN/jar`, and a user who has never created an organization for `orgs-first-trial`.

- **No organization.** `POST /rpc/subscription` with `{}`. The body has `"code":"NO_ORGANIZATION"` and `"status":403`.
- **First organization.** `POST /auth/organization/create` with `{"name":"Verify A","slug":"verify-a-$RUN_ID"}`, then `POST /auth/organization/set-active` with `{"organizationId":"<id>"}`, then `POST /rpc/subscription`. The body is `{"json":{"kind":"trial","endsAt":"<30 days from now>"}}`.
- **Second organization.** Create `Verify B`, set it active, and read `/rpc/subscription`. The body is `{"json":{"kind":"denied","reason":"trial_expired"}}`.
- **Deleted active organization.** Set `Verify A` active, `POST /auth/organization/delete` with `{"organizationId":"<A id>"}`, and read `/rpc/subscription`. It answers for `Verify B` rather than the deleted one.
- **Client-set trial.** Create an organization with `"trialEndsAt":"2099-01-01T00:00:00Z"` in the body. The response's `trialEndsAt` is the creation time, not 2099.
- **Dashboard.** Open `/dashboard` while signed in with the same session and screenshot the trial line.

## Gotchas

- The browser drive needs the API's session cookie. Signing in through the dashboard (see accounts) and then calling the API from the page with `evaluate(fetch(..., { credentials: "include" }))` keeps both in one session.
- The trial belongs to the user, not the organization. Reusing a user who already created an organization makes `orgs-first-trial` look broken.
- Session reads are cached for 5 minutes. Set the active organization explicitly before each read instead of relying on what `create` did.
