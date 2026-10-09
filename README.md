# shiru

A TypeScript monorepo created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack): React, TanStack Router, Hono, oRPC, Drizzle, Better Auth with Polar, and shadcn/ui. Both apps run on Cloudflare Workers. [Vite+](https://viteplus.dev) handles installing, running tasks, linting, formatting, and type checking.

## Getting started

```bash
vp install
```

Create `apps/api/.env` with local values:

```dotenv
DASHBOARD_URL=http://localhost:3001
SITE_URL=http://localhost:3002
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<at least 32 characters>
POLAR_ACCESS_TOKEN=<Polar sandbox token>
POLAR_WEBHOOK_SECRET=<Polar sandbox webhook secret>
```

Create `apps/dashboard/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Start both apps, then create the local database's tables:

```bash
vp run dev
vp run db:push
```

The dashboard runs at http://localhost:3001, the site at http://localhost:3002, and the API at http://localhost:3000.

## Environment

`.env` files hold local values only. In production, Cloudflare supplies them.

- `apps/api/.env.schema` lists the variables the API needs and their types. `vp run dev` runs `varlock load` first, so a missing or malformed value stops dev with a clear error instead of a 500 at runtime. When you add a secret, add it to both the schema and `cloudflare.config.ts`.
- The API declares its bindings in `apps/api/cloudflare.config.ts` and reads them from `cloudflare:workers`. Everything that comes from the environment is a Worker secret. Locally, `cf dev` reads secrets from `apps/api/.env`. In production, set them in the Cloudflare dashboard or with `cf deploy --secrets-file <file>`. Deploys keep them.
- CORS allows two origins. `DASHBOARD_URL` gets credentialed requests for auth and the dashboard. `SITE_URL` is the marketing site, which calls `waitlist.join` without credentials.
- `ENVIRONMENT` follows the build mode. In development, Polar uses its sandbox and auth cookies stay on localhost. In production, Polar uses the live API and cookies are shared across `.shiru.sh`.
- PostHog is off in development. In production, the API reports errors when the `POSTHOG_KEY` secret is set.
- The dashboard reads `VITE_API_URL`, `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` at build time, from `apps/dashboard/.env` locally and from the build environment in production. They are baked into the bundle, so rebuild when they change.

## Database

The API uses Cloudflare D1 (`shiru-api`). Drizzle owns the schema in `apps/api/src/schema`.

There are no migrations yet while the schema is still changing. `vp run db:push` syncs the schema straight to the local database used by `cf dev`. Before the first deploy, `vp run db:generate` writes a single migration to `apps/api/drizzle` and `vp run db:migrate` applies it to the production database.

## Auth and email

Better Auth serves its routes under `/auth` on the API, with email and password sign-in, email verification, and organizations. The Polar plugin creates a Polar customer on sign-up, links an existing customer with the same email, and deletes it when the user is deleted. Checkout products are listed in `apps/api/src/utils/auth.ts`.

Emails are React Email components in `apps/api/src/emails`, sent through the Cloudflare `EMAIL` binding. In local development, `cf dev` simulates sending.

## API procedures and billing

`apps/api/src/utils/orpc.ts` defines four procedure levels. Each one adds typed context and typed errors on top of the one below it:

- `publicProcedure` runs for anyone. Context has `headers` and `auth` (the session or `null`).
- `authedProcedure` requires a signed-in user and adds `user` and `session`. It fails with `UNAUTHORIZED` (401).
- `organizationProcedure` also requires an organization and adds `organizationId`. If the session has no active organization, it activates the user's first one. It fails with `NO_ORGANIZATION` (403).
- `paidProcedure` also requires paid access and adds `access`, which is either an active Polar subscription or the organization's trial. It fails with `PAYMENT_REQUIRED` (402), with a `reason` of `no_active_subscription` or `trial_expired`.

Each user gets one 30-day trial, no card needed. It goes to the first organization they create. Later organizations start without one, even if the first is deleted. The trial end is stored in `organizations.trial_ends_at`, so you can extend a trial by updating that row. Users must verify their email before they can sign in.

Access rules live in `apps/api/src/utils/billing.ts`. Polar's `subscription.created` and `subscription.updated` webhooks keep the `subscriptions` table in sync. A checkout has to pass the organization ID as `referenceId` so the subscription can be linked to it, as the dashboard's upgrade button does.

## Deployment

Pushes to `main` deploy through the `deploy` job in `.github/workflows/ci.yml`, after checks, build and tests pass. It applies pending D1 migrations, then deploys the three Workers:

- `shiru-api` serves `api.shiru.sh`.
- `shiru-dashboard` serves `app.shiru.sh`.
- `shiru-site` serves `shiru.sh`.

The job needs three repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `NUCLEO_LICENSE_KEY`. Production URLs live in each app's Cloudflare config and in `apps/dashboard/.env.production`. The API's `BETTER_AUTH_SECRET`, `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` are Worker secrets, set with `cf workers secrets update`.

To deploy by hand, export `CLOUDFLARE_API_TOKEN`, then run `vp run build` and `vp run deploy`. Schema changes need a migration: run `vp run db:generate` in `apps/api` and commit the new folder in `apps/api/drizzle`.

## UI

Shared shadcn/ui primitives live in `packages/ui`. Design tokens are in `packages/ui/src/styles/globals.css`.

```bash
npx shadcn@latest add dialog popover -c packages/ui
```

```tsx
import { Button } from "@shiru/ui/components/button";
```

Run the shadcn CLI from `apps/dashboard` for app-specific blocks.

## Scripts

- `vp run dev`, `vp run dev:dashboard`, and `vp run dev:api` start the dev servers.
- `vp run build` builds both apps.
- `vp check` formats, lints, and type checks. `vp check --fix` applies fixes. Route and binding types are generated by dev or build, so run one of them first on a fresh clone.
- `vp run check-types` type checks only.
- `vp run test` runs the API tests with coverage. CI fails if coverage drops below the thresholds in `apps/api/vite.config.ts`. See `AGENTS.md` for how to write tests.
- `vp run deploy:dry-run` validates the API build output without uploading.
- `vp run update` interactively updates every dependency in the repo to its latest version.
- `vp run hooks:setup` installs the Vite+ Git hooks. The `staged` block in `vite.config.ts` sets what runs on commit.

CI (`.github/workflows/ci.yml`) installs, builds, runs `vp check` and the tests, and does deploy dry runs. It uses example URLs and needs no secrets.

## Structure

```
apps/
  dashboard/          React + TanStack Router frontend
  api/                Hono + oRPC API on Workers
    drizzle/          generated migrations
    src/routers/      oRPC routers
    src/schema/       Drizzle tables
    src/utils/        db, auth, context, and oRPC procedures
packages/
  ui/                 shadcn/ui components and styles
```

The dashboard imports the router type straight from `apps/api/src/routers`, so API changes type check end to end.
