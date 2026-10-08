# Accounts and email verification

People create an account on `/login`, must confirm their email through an emailed link before they can sign in, and then reach the protected `/dashboard`. Signed-out visitors to `/dashboard` are sent to `/login`.

## Sub-features

- `accounts-sign-up` creates an account and shows `Check <email> for a link to verify your account`.
- `accounts-verify-email` sends a `Verify your email address` email whose link signs the user in and opens `/dashboard`.
- `accounts-unverified-sign-in` rejects sign-in before verification with `Email not verified`.
- `accounts-sign-in` signs a verified user in and opens `/dashboard`, which shows `Welcome <name>` and `API: This is private`.
- `accounts-protected-redirect` sends a signed-out visitor from `/dashboard` to `/login`.
- `accounts-sign-out` signs out from the header menu and returns to `/`.

## How to get to it (user POV)

- Choose `Sign In` in the header, which opens `/login` on the sign-up form.
- Switch forms with `Already have an account? Sign In` and `Need an account? Sign Up`.
- Open the link in the verification email.
- Open the header menu labelled with the user's name, then choose `Sign Out`.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0.
- Sign-up needs a real Polar sandbox `POLAR_ACCESS_TOKEN`, because a Polar customer is created at sign-up. With placeholder secrets, sign-up fails with `Polar customer creation failed`; report `accounts-sign-up` and `accounts-verify-email` as blocked and drive the rest with an existing verified user.

- **Sign up.** On `/login`, fill `#name`, `#email` (`verify-$RUN_ID@example.com`) and `#password` (8+ characters), then submit with `click("form button[type=submit]")`. A toast reads `Check verify-…@example.com for a link to verify your account`, and the page stays on `/login`.
- **Unverified sign-in.** Run `curl -s -H 'content-type: application/json' -H 'Origin: http://localhost:3001' -X POST -d '{"email":"<email>","password":"<password>"}' http://localhost:3000/auth/sign-in/email`. The body has `"code":"EMAIL_NOT_VERIFIED"`.
- **Verification email.** Run `.claude/skills/verify-shiru/scripts/latest-email.sh <email>`. It saves the email under `evidence/emails/` and prints the link. To get a fresh one for an existing unverified user, `POST /auth/send-verification-email` with `{"email":"<email>","callbackURL":"http://localhost:3001/dashboard"}`.
- **Verify.** Open the printed link in the browser with `goto(link)`. The browser lands on `http://localhost:3001/dashboard` showing `Welcome <name>`.
- **Sign in and out.** Run `node .claude/skills/verify-shiru/scripts/browser.mjs .claude/skills/verify-shiru/steps/sign-in-out.mjs "$(cat .verify/current)/evidence/accounts-sign-in"` with `VERIFY_EMAIL` and `VERIFY_PASSWORD` set to a verified user. It signs in, checks the dashboard, signs out, and checks that `/dashboard` redirects to `/login`.

## Gotchas

- `/login` has two `Sign In` controls: the header link and the form's submit button. Submit forms with `click("form button[type=submit]")`, not `clickButton("Sign In")`.
- `/login` opens on the sign-up form, not sign-in.
- The verification link points at the API (`localhost:3000/auth/verify-email?...`) and redirects to the dashboard. Assert the final URL, not the link.
- Sessions use a 5-minute cookie cache. A session read right after a server-side change can be up to 5 minutes stale.
- Accounts persist in the shared local D1. Always use a new email.
