# Accounts and email verification

People create an account on `/auth/sign-up`, confirm their email through an emailed link, and then reach the signed-in dashboard at `/`. Signed-out visitors to any dashboard page are sent to `/auth/sign-in?redirect=<page>` and return there after signing in. Forgotten passwords are reset through an emailed link. Account settings live on `/settings/account`.

## Sub-features

- `accounts-sign-up` creates an account and opens `/auth/verify-email?email=<email>`, which shows `Check your inbox` and a `Resend email` button.
- `accounts-verify-email` sends a `Verify your email address` email whose link signs the user in and opens the sign-up's `redirect` (default `/`). A user with no organization then lands on `/onboarding`.
- `accounts-unverified-sign-in` rejects sign-in before verification and sends the user to `/auth/verify-email`.
- `accounts-sign-in` signs a verified user in and opens `redirect`, or `/`.
- `accounts-protected-redirect` sends a signed-out visitor from any dashboard page to `/auth/sign-in?redirect=<page>`.
- `accounts-sign-out` signs out from the sidebar user menu and returns to `/auth/sign-in`.
- `accounts-reset-password` emails a `Reset your password` link from `/auth/forgot-password`. The link opens `/auth/reset-password?token=…`, and the new password signs in.
- `accounts-settings` updates the name, theme and password, and deletes the account, on `/settings/account`.

## How to get to it (user POV)

- Open `http://localhost:3001/`. Signed out, it shows the sign-in card, which links to `Sign up` and `Forgot password?`.
- Open the link in the verification or reset email.
- Open the user menu at the bottom of the sidebar (avatar, name and email). It has `Account`, a `Theme` submenu and `Sign out`.
- Choose `Account` under `Settings` in the sidebar for profile, appearance, password and account deletion.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0.
- Sign-up needs a real Polar sandbox `POLAR_ACCESS_TOKEN`, because a Polar customer is created at sign-up. With placeholder secrets or an expired token, sign-up fails with `Polar customer creation failed` (500); report `accounts-sign-up` and `accounts-verify-email` as blocked and drive the rest with an existing verified user.

- **Sign up.** On `/auth/sign-up`, fill `[name=name]`, `[name=email]` (`verify-$RUN_ID@example.com`) and `[name=password]` (8+ characters), then `click("form button[type=submit]")`. The page moves to `/auth/verify-email` and shows `Check your inbox`.
- **Unverified sign-in.** Run `curl -s -H 'content-type: application/json' -H 'Origin: http://localhost:3001' -X POST -d '{"email":"<email>","password":"<password>"}' http://localhost:3000/auth/sign-in/email`. The body has `"code":"EMAIL_NOT_VERIFIED"`. In the browser, the same sign-in moves to `/auth/verify-email`.
- **Verification email.** Run `.claude/skills/verify-shiru/scripts/latest-email.sh <email>`. It saves the email under `evidence/emails/` and prints the link.
- **Verify.** `goto(link)` in the browser. A user without an organization lands on `/onboarding` showing `Create your organization`.
- **Sign in and out.** Run `node .claude/skills/verify-shiru/scripts/browser.mjs .claude/skills/verify-shiru/steps/sign-in-out.mjs "$(cat .verify/current)/evidence/accounts-sign-in"` with `VERIFY_EMAIL` and `VERIFY_PASSWORD` set to a verified user who has an organization. It checks the redirect round trip, the API session, and sign-out.
- **Reset password.** On `/auth/forgot-password`, fill `[name=email]` and submit; the card shows `Check your inbox`. `latest-email.sh <email>` prints the `/auth/reset-password/<token>` link. `goto(link)` lands on `/auth/reset-password?token=…`. Fill `[name=password]` and `[name=confirm]` and submit; it returns to `/auth/sign-in` with `Password updated`. Sign in with the new password.
- **Account settings.** On `/settings/account`, change `[name=name]` and `clickButton("Save")`; `GET /auth/get-session` shows the new name. Fill `[name=currentPassword]` and `[name=newPassword]`, then `clickButton("Change password")`.

## Gotchas

- Inputs have no stable ids. Select them by `name`: `[name=email]`, `[name=password]`, `[name=confirm]`, `[name=currentPassword]`, `[name=newPassword]`.
- `fill()` sets values by script, so the browser skips `minLength` and `pattern` checks. A too-short password reaches the API and comes back as a `Password too short` toast. Only typed input exercises the client-side checks.
- Open the user menu with `press("[data-sidebar=footer] button")`. `click()` does not open Base UI menus.
- Sign-out and account deletion do a full page load, so wait for the URL, not a toast.
- The verification and reset links point at the API (`localhost:3000/auth/...`) and redirect to the dashboard. Assert the final URL, not the link.
- Sessions use a 5-minute cookie cache. A session read right after a server-side change can be up to 5 minutes stale.
- Accounts persist in the shared local D1. Always use a new email.
