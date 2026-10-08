# shiru

A TypeScript monorepo created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack): React, TanStack Router, Hono, oRPC, Drizzle, Better Auth with Polar, and shadcn/ui. Both apps run on Cloudflare Workers. [Vite+](https://viteplus.dev) handles installing, running tasks, linting, formatting, and type checking.

## Getting started

```bash
vp install
```

Create `apps/api/.env` with local values:

```dotenv
DASHBOARD_URL=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<at least 32 characters>
POLAR_ACCESS_TOKEN=<Polar sandbox token>
POLAR_WEBHOOK_SECRET=<Polar sandbox webhook secret>
```

Create `apps/dashboard/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Create the local database and start both apps:

```bash
vp run db:migrate:local
vp run dev
```

The dashboard runs at http://localhost:3001 and the API at http://localhost:3000.

## Environment

`.env` files hold local values only. In production, Cloudflare supplies them.

- `apps/api/.env.schema` lists the variables the API needs and their types. `vp run dev` runs `varlock load` first, so a missing or malformed value stops dev with a clear error instead of a 500 at runtime. When you add a secret, add it to both the schema and `cloudflare.config.ts`.
- The API declares its bindings in `apps/api/cloudflare.config.ts` and reads them from `cloudflare:workers`. Everything that comes from the environment is a Worker secret. Locally, `cf dev` reads secrets from `apps/api/.env`. In production, set them in the Cloudflare dashboard or with `cf deploy --secrets-file <file>`. Deploys keep them.
- `ENVIRONMENT` follows the build mode. In development, Polar uses its sandbox and auth cookies stay on localhost. In production, Polar uses the live API and cookies are shared across `.shiru.sh`.
- PostHog is off in development. In production, the API reports errors when the `POSTHOG_KEY` secret is set.
- The dashboard reads `VITE_API_URL`, `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` at build time, from `apps/dashboard/.env` locally and from the build environment in production. They are baked into the bundle, so rebuild when they change.

## Database

The API uses Cloudflare D1 (`shiru-api`). Drizzle owns the schema in `apps/api/src/schema` and writes migrations to `apps/api/drizzle`.

- `vp run db:generate` creates a migration from schema changes.
- `vp run db:migrate:local` applies migrations to the local database used by `cf dev`.
- `vp run db:migrate` applies migrations to the production database.

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

Authenticate once with `cf auth login` from `apps/api`. Then run `vp run db:migrate`, `vp run deploy:api` and `vp run deploy:dashboard`.

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
- `vp run deploy:dry-run` validates the build output without uploading.
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
