# Onboarding & Custom Domains -- Follow-up Plan

This document captures deferred work from the initial onboarding + custom domain implementation. Each section is a self-contained task that a future agent can pick up.

---

## 1. Docs-Serving Worker

**Priority**: High (required for custom domains to actually work end-to-end)

The current implementation registers custom hostnames with Cloudflare and handles DNS verification, but nothing actually serves documentation when a request hits `docs.example.com`.

### What needs to happen

- Create a new Cloudflare Worker (`shiru-docs`) or add a route within the existing API worker that handles requests from custom hostnames
- On incoming request: extract `Host` header -> look up `custom_domains` in D1 -> resolve to org -> fetch and render that org's documentation
- One-time Cloudflare setup: configure the fallback origin via `PUT /zones/{zone_id}/custom_hostnames/fallback_origin` with `{ origin: "docs.shiru.sh" }` (or whatever hostname the docs worker is deployed to)
- The worker needs access to the same D1 database (shared binding)

### Architecture decision

Decide whether the docs worker is:
- A **separate Worker** (clean separation, independent scaling, own wrangler.jsonc)
- A **route within the existing API worker** (simpler, shared D1 binding already set up, but couples concerns)

Recommendation: separate Worker in `apps/docs-worker/` -- docs serving has very different performance characteristics (cacheable, read-heavy, public) vs the API (auth-gated, write-heavy, session-aware).

### Key files to reference

- `apps/api/src/schema/custom-domain.ts` -- the `custom_domains` table schema
- `apps/api/wrangler.jsonc` -- D1 binding configuration pattern
- `apps/api/src/utils/db.ts` -- how to connect Drizzle to D1

---

## 2. Additional Onboarding Steps (blocked on editor)

**Priority**: Medium (unblocked when the editor/content model ships)

The current onboarding checklist has 3 steps. These additional steps should be added once the prerequisite features exist:

| Step | Completion Check | Blocked On |
|---|---|---|
| Create your first page | At least 1 document/page exists for the org | Editor content model |
| Publish your docs | Docs have been published at least once | Publishing pipeline |
| Customize your docs theme | Org has custom theme/branding settings saved | Theme/branding feature |

### Implementation

- Add new boolean fields to the `onboarding.getStatus` endpoint in `apps/api/src/routers/onboarding-router.ts`
- The sidebar checklist component (`apps/dashboard/src/components/onboarding-checklist.tsx`) already handles N items dynamically via the `onboardingSteps` array -- just add new entries with the appropriate `completed` field mapping and route

---

## 3. Wildcard Domain Support

**Priority**: Low

Currently limited to specific subdomains (e.g., `docs.example.com`). Some users may want `*.example.com`.

- Cloudflare Custom Hostnames API supports `wildcard: true` in the SSL config
- May require an Enterprise Cloudflare plan
- Requires additional hostname validation logic
- Update `domain.create` input validation to accept wildcard patterns
- Update the docs worker to handle wildcard resolution

---

## 4. Multiple Domains Per Org

**Priority**: Low

Currently enforced as one domain per org (unique constraint on `organization_id` in `custom_domains`).

### Changes needed

- Remove the unique constraint on `custom_domains.organization_id` (new migration)
- Update `domain.get` to return an array instead of a single domain
- Update `domain.create` to allow multiple domains
- Update the settings UI (`apps/dashboard/src/routes/_app/settings/domain.tsx`) to list/manage multiple domains
- Update the docs worker to handle multiple hostnames mapping to the same org
- Consider a limit (e.g., max 5 domains per org based on plan tier)

---

## 5. Domain Health Monitoring

**Priority**: Medium

Proactively detect and alert on domain issues before users notice.

### Implementation

- Create a Cloudflare Cron Trigger (scheduled worker) that runs periodically (e.g., every hour)
- For each active custom domain, call `GET /zones/{zone_id}/custom_hostnames/{id}` to check status
- If SSL cert is expiring within 7 days, or domain becomes unresolvable, or verification lapses:
  - Update `custom_domains.status` in DB
  - Send email notification to org owner via Resend
  - Show a warning banner in the dashboard
- Add a `last_checked_at` column to `custom_domains` to track polling

### Key files

- `apps/api/wrangler.jsonc` -- add `[triggers]` section for cron
- `apps/api/src/schema/custom-domain.ts` -- add `last_checked_at` column

---

## 6. Onboarding Analytics

**Priority**: Low

Track onboarding effectiveness to improve conversion.

### Events to instrument

| Event | Properties |
|---|---|
| `onboarding.viewed` | `org_id`, `completed_steps`, `total_steps` |
| `onboarding.step_completed` | `org_id`, `step_name`, `time_since_org_created` |
| `onboarding.dismissed` | `org_id`, `completed_steps`, `total_steps` |
| `onboarding.all_complete` | `org_id`, `time_since_org_created` |
| `domain.setup_started` | `org_id`, `hostname` |
| `domain.verification_complete` | `org_id`, `hostname`, `time_since_setup` |
| `domain.setup_failed` | `org_id`, `hostname`, `error_reason` |

### Implementation

- Use PostHog (see `posthog-instrumentation` skill)
- Instrument in `onboarding-checklist.tsx` and `domain.tsx` settings page
- Track time-to-complete for each step
- Track dismiss rate and re-engagement rate
