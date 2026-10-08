# Billing and paid access

Organizations pay through Polar. The dashboard's `Upgrade` button starts a Polar checkout for the active organization, and once Polar reports the subscription, paid features open for that organization. Paid API procedures refuse unpaid organizations with a typed `PAYMENT_REQUIRED` error.

## Sub-features

- `billing-upgrade` sends the user from `Upgrade` on `/dashboard` to a Polar sandbox checkout for `starter-monthly`.
- `billing-subscription-sync` records the subscription when Polar's `subscription.created` or `subscription.updated` webhook arrives.
- `billing-manage` shows `Manage subscription` instead of `Upgrade` once subscribed, which opens the Polar customer portal.
- `billing-paid-denied` refuses paid procedures with `PAYMENT_REQUIRED` (402) and a `reason` of `trial_expired` or `no_active_subscription`.

## How to get to it (user POV)

- Open `/dashboard` with an active organization, then choose `Upgrade`.
- After paying, the same panel shows `Manage subscription`.

## Driving it with verify-shiru

Preconditions:

- `doctor.sh` exits 0 without the placeholder note: a real Polar sandbox `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` are set.
- Polar can only deliver webhooks to a public URL. Expose `http://localhost:3000` with a tunnel and point the sandbox webhook at `<tunnel>/auth/polar/webhooks`.
- A signed-in user whose active organization is in its trial or has an expired one.

- **Upgrade.** On `/dashboard`, `clickButton("Upgrade")`. The browser leaves for a `polar.sh` sandbox checkout page. Screenshot it.
- **Pay.** Complete the sandbox checkout with Polar's test card. It returns to `http://localhost:3001/success?checkout_id=…`.
- **Sync.** After the webhook arrives, `POST /rpc/subscription`. The body is `{"json":{"kind":"subscription","status":"active",...}}`. Reload `/dashboard`; it shows `Manage subscription`.
- **Denied.** For an organization with no trial and no subscription, call any route built on `paidProcedure`. The body has `"code":"PAYMENT_REQUIRED"` and a `reason`.

## Gotchas

- No route uses `paidProcedure` yet. `billing-paid-denied` can only be driven once a paid route exists; until then report it as not reachable.
- Without a tunnel, checkout succeeds but no webhook reaches the API, so the dashboard keeps showing `Upgrade`. That is a setup gap, not a billing bug.
- The checkout carries the organization as `referenceId`. A subscription created any other way (for example in the Polar dashboard) is not linked to an organization and is ignored.
- Product ids in `apps/api/src/utils/auth.ts` must exist in the Polar sandbox, or checkout fails before leaving the dashboard.
