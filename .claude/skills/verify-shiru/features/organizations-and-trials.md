# Organizations and trials

Each user works inside an organization. A signed-in user with no organization lands on `/onboarding` to create one. A user's first organization gets a 30-day trial with no card. Any later organization starts without a trial, even if the first one was deleted. The sidebar's organization switcher shows the active organization and its trial state, and `/settings/organization` manages details, members and invitations.

## Sub-features

- `orgs-onboarding` sends a signed-in user with no organization to `/onboarding`, where `Create organization` creates one, makes it active and opens `/`.
- `orgs-first-trial` gives the first organization a trial ending 30 days after creation. The switcher and the dashboard alert read `Trial until <date>`.
- `orgs-no-second-trial` gives later organizations no trial (`Trial ended`).
- `orgs-switch` changes the active organization from the switcher at the top of the sidebar. `New organization` opens the same form in a dialog.
- `orgs-settings` edits name, slug and logo URL. Owners and admins can save; members see the fields disabled.
- `orgs-members` changes a member's role (owner and admins only) and removes members.
- `orgs-invitations` emails a `Join <org> on Shiru` link to `/invite/<id>`. Pending invitations show in the members table with copy-link and cancel buttons.
- `orgs-accept-invite` sends a signed-out visitor from `/invite/<id>` to sign-up, back to the invitation after verification, and into the organization on `Accept invitation`.
- `orgs-leave-delete` lets members leave and owners delete (after typing the slug). The user moves to another organization they belong to, or to `/onboarding` if none is left.
- `orgs-trial-not-settable` ignores a `trialEndsAt` sent by the client.

## How to get to it (user POV)

- Sign up and verify. The first stop is `/onboarding`.
- Open the switcher at the top of the sidebar to change or create organizations.
- Choose `Organization` under `Settings` in the sidebar.
- Open the link in an invitation email.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0. Placeholder secrets are fine once a verified user exists.
- A verified user who has never created an organization for `orgs-first-trial`.

- **Onboarding.** Follow a fresh user's verification link. On `/onboarding`, fill `[name=name]`; `[name=slug]` fills itself from the name. Submit, and `/` shows `No docs yet` with `Trial until <date>`. `POST /rpc/subscription` returns `{"json":{"kind":"trial","endsAt":"<30 days from now>"}}`.
- **Invite.** On `/settings/organization`, `clickButton("Invite")`, fill `[role=dialog] [name=email]`, and `click("[role=dialog] button[type=submit]")`. A row reads `Invitation pending`. To find the link, search the run's email text files for `localhost:3001/invite/`. `latest-email.sh` prints only `/auth/` links.
- **Accept.** Signed out, `goto(<invite link>)` lands on `/auth/sign-up?redirect=/invite/<id>`. Sign up with the invited email and follow the verification link. It returns to `/invite/<id>` showing `Join <org>`. `clickButton("Accept invitation")` opens `/` inside that organization.
- **Switch.** `press("[data-sidebar=header] button")` opens the switcher. Click the target item with `evaluate` on `[role=menuitem]` matching its name, because the item's text also contains the avatar initials. `GET /auth/organization/get-full-organization` returns the new active organization.
- **Role.** `press("table [role=combobox]")` opens a member's role select, then `clickButton("Admin")`. `get-full-organization` shows the new role.
- **Leave or delete.** As a member, `clickButton("Leave organization")` twice (card, then dialog `Leave`). As owner, `clickButton("Delete organization")`, fill `[role=dialog] input` with the slug, and click the dialog's `Delete organization`. With another organization left, the page reloads on `/`; otherwise on `/onboarding`.
- **Second organization (API).** `POST /auth/organization/create` with `{"name":"Verify B","slug":"verify-b-$RUN_ID"}`, `POST /auth/organization/set-active`, then `POST /rpc/subscription`. The body is `{"json":{"kind":"denied","reason":"trial_expired"}}`.
- **Client-set trial (API).** Create an organization with `"trialEndsAt":"2099-01-01T00:00:00Z"` in the body. The response's `trialEndsAt` is the creation time, not 2099.

## Gotchas

- `POST /auth/organization/create` and `accept-invitation` do not change the session's active organization. The dashboard calls `set-active` right after both; API drives must do the same.
- Signing in picks the user's first membership as the active organization, so a user who joined any organization skips `/onboarding`.
- The trial belongs to the user, not the organization. Reusing a user who already created an organization makes `orgs-first-trial` look broken.
- Slugs are unique across the shared D1. Put `$RUN_ID` in every organization name.
- Base UI menus and selects need `press()`, not `click()`.
