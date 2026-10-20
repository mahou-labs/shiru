# Contributing to Shiru

This guide covers how the code is organized, how to check and test a change, and how Shiru is deployed. To get the apps running first, follow [Run Shiru locally](README.md#run-shiru-locally). [AGENTS.md](AGENTS.md) has the rules for writing API tests and for commits.

## Stack

Shiru is a TypeScript monorepo. The dashboard is React with TanStack Router. The API is Hono and oRPC, with Drizzle on Cloudflare D1 and Better Auth with Polar for accounts and billing. The marketing site is Astro. Docs sites are built with [Nimbus](https://nimbus-docs.com/) in a container. Everything runs on Cloudflare Workers. [Vite+](https://viteplus.dev) handles installing, running tasks, linting, formatting, and type checking.

```
apps/
  api/                Hono + oRPC API on Workers
    drizzle/          generated migrations
    src/docs/         drafts, publishing, previews and docs hostnames
    src/routers/      oRPC routers
    src/schema/       Drizzle tables
    src/utils/        db, auth, context, and oRPC procedures
  builder/            container image and build-site script that build docs sites
  dashboard/          React + TanStack Router frontend
  dispatch/           Dispatch Worker that routes docs hostnames to site Workers
  site/               Astro marketing site
packages/
  site-template/      Nimbus project that every new doc starts as (npm, not a workspace member)
  ui/                 shadcn/ui components and styles
```

The dashboard imports the router type straight from `apps/api/src/routers`, so API changes type check end to end. [docs-platform-architecture.md](docs-platform-architecture.md) explains how publishing works, from a draft to a live site.

## Scripts

- `vp run dev` starts every app. `vp run dev:dashboard` and `vp run dev:api` start one.
- `vp run build` builds every app.
- `vp check` formats, lints, and type checks. `vp check --fix` applies fixes. Dev and build generate the route and binding types, so run one of them first on a fresh clone.
- `vp run check-types` type checks only.
- `vp run test` runs the API, dashboard and Dispatch Worker tests. The API tests run with coverage, and CI fails if coverage drops below the thresholds in `apps/api/vite.config.ts`.
- `vp run deploy:dry-run` validates the build output without uploading.
- `vp run update` interactively updates every dependency to its latest version.
- `vp run hooks:setup` installs the Vite+ Git hooks. The `staged` block in `vite.config.ts` sets what runs on commit.

CI (`.github/workflows/ci.yml`) runs on every push to `main` and on every pull request. It installs, builds, runs `vp check` and the tests, and does deploy dry runs.

## Environment

`.env` files hold local secrets only. In production, Cloudflare supplies them.

- `apps/api/.env.schema` lists the secrets the API needs and their types. `vp run dev` runs `varlock load` first, so a missing or malformed value stops dev with a clear error instead of a 500 at runtime. When you add a secret, add it to both the schema and `apps/api/cloudflare.config.ts`.
- The API declares its bindings in `apps/api/cloudflare.config.ts` and reads them from `cloudflare:workers`. Plain values such as `DASHBOARD_URL`, `SITE_URL` and `DOCS_DOMAIN` are set there, with one value for development and one for production. Locally, `cf dev` reads secrets from `apps/api/.env`.
- CORS allows two origins. `DASHBOARD_URL` gets credentialed requests for auth and the dashboard. `SITE_URL` is the marketing site, which calls `waitlist.join` without credentials.
- `ENVIRONMENT` follows the build mode. In development, Polar uses its sandbox and auth cookies stay on localhost. In production, Polar uses the live API and cookies are shared across `.shiru.sh`.
- The dashboard reads `VITE_API_URL`, `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` at build time, from `apps/dashboard/.env` locally and from `apps/dashboard/.env.production` in production. They are baked into the bundle, so rebuild when they change.

## Database

The API uses Cloudflare D1 (`shiru-api`). Drizzle owns the schema in `apps/api/src/schema`.

`vp run db:push` syncs the schema straight to the local database that `cf dev` creates, so run `vp run dev` once before it. A schema change that has to reach production needs a migration. Run `vp run db:generate` and commit the new folder in `apps/api/drizzle`. Deploys apply pending migrations with `vp run db:migrate`.

## Auth and email

Better Auth serves its routes under `/auth` on the API, with email and password sign-in, email verification, and organizations. Users must verify their email before they can sign in. The Polar plugin creates a Polar customer on sign-up, links an existing customer with the same email, and deletes it when the user is deleted.

Emails are React Email components in `apps/api/src/emails`, sent through the Cloudflare `EMAIL` binding. In development, `cf dev` simulates sending, and the emails show up in the local explorer at http://localhost:3000/cdn-cgi/local/explorer.

## API procedures and billing

`apps/api/src/utils/orpc.ts` defines four procedure levels. Each one adds typed context and typed errors on top of the one below it:

- `publicProcedure` runs for anyone. Context has `headers` and `auth` (the session or `null`).
- `authedProcedure` requires a signed-in user and adds `user` and `session`. It fails with `UNAUTHORIZED` (401).
- `organizationProcedure` also requires an organization and adds `organizationId`. If the session has no active organization, it activates the user's first one. It fails with `NO_ORGANIZATION` (403).
- `paidProcedure` also requires paid access and adds `access`, which is either an active Polar subscription or the organization's trial. It fails with `PAYMENT_REQUIRED` (402), with a `reason` of `no_active_subscription` or `trial_expired`.

Each user gets one 30-day trial, no card needed. It goes to the first organization they create. Later organizations start without one, even if the first is deleted. The trial end is stored in `organizations.trial_ends_at`, so you can extend a trial by updating that row.

Access rules live in `apps/api/src/utils/billing.ts`. Polar's `subscription.created` and `subscription.updated` webhooks keep the `subscriptions` table in sync. A checkout has to pass the organization ID as `referenceId` so the subscription can be linked to it, as the dashboard's upgrade button does.

## Docs traffic

`apps/dispatch` is the Dispatch Worker, `shiru-dispatch`. It is the single entry point for docs sites. It maps `<slug>.shiru.page` to the site Worker named `<slug>` in the `shiru-docs` dispatch namespace and passes the response through. It serves a custom hostname from its doc's Worker and redirects a doc with an active custom domain there. It reads both from the `DOMAINS` KV namespace that `apps/api` writes. It answers 404 for unknown hostnames, invalid names, and slugs with no deployed Worker. Hostname rules come from `apps/api/src/docs/names.ts`.

Each site Worker has Workers Cache turned on. The Worker version is part of the cache key, so each deploy starts with an empty cache and nothing needs purging. The template's `public/_headers` lets the edge keep responses until the next deploy and browsers keep the hashed files in `/_astro/`.

Previews live at `<label>--<slug>.preview.shiru.page` and are served from the Worker `<slug>--<label>`, only to members of the doc's organization. A visitor without a preview cookie goes to the API's `/preview/authorize`, which checks the dashboard session and membership and sends a member back with a one-minute signed grant. The Dispatch Worker trades that grant for an hour-long cookie on the preview host. Both Workers sign and check grants with `apps/api/src/docs/preview-access.ts`. The API's cron runs every 10 minutes and deletes draft previews that nobody requested for 30 days.

In development there is no dispatch namespace. `vp run dev` starts the Dispatch Worker on port 3003, and browsers resolve `*.localhost` to your machine. `http://acme.docs.localhost:3003/` serves site `acme`, and `http://draft--acme.preview.docs.localhost:3003/` serves its draft preview. The Dispatch Worker forwards the request to the API's dev-only route `/dev/docs/<worker name>/<path>`, which serves the build from its build container.

Each doc's files live in a Git repository in Cloudflare Artifacts, which `cf dev` can't simulate. Development uses the real `shiru-staging` namespace on the account the `cf` CLI is signed in to, and builds run in a local Docker container. `apps/api/scripts/verify-publish.ts` publishes a doc end to end this way, with its own dev servers and database.

## Docs sites

Each doc's repo holds a complete [Nimbus](https://nimbus-docs.com/) project under `docs/`, so a developer can clone it and run `npm install && npx astro dev`. A new doc starts as a copy of `packages/site-template`, with its name written into two files:

```
docs/
  package.json  package-lock.json  astro.config.ts  nimbus.json  tsconfig.json
  docs.config.json          # shiru's site config: name, description, logo, github and navigation
  public/                   # served from the site root; the logo goes here
  src/content/docs/         # pages, as .mdx or .md
  src/components/  src/layouts/  src/pages/  src/styles/  src/lib/
```

`packages/site-template` is the one source for three things:

- It is a plain npm project that builds on its own: `npm ci && SITE_URL=https://example.com npx astro build`. `astro.config.ts` reads `docs.config.json` and maps it to the Nimbus config.
- The API embeds every file git tracks there (`apps/api/src/docs/starter.ts`) and seeds a new doc with them as drafts. A test checks that the seeded files match `git ls-files -s` byte for byte.
- The builder image installs only its `package.json` and `package-lock.json`, because builds run with no network. `build-site` links those `node_modules` into the doc's project and runs `astro build` and `nimbus-docs lint` there. It refuses a project that commits its own `node_modules`. The image builds from the repository root, and `.dockerignore` keeps everything else out of the context.

`apps/builder/fixtures` hold only what differs from the template. `apps/builder/scripts/verify.sh` builds each one as the template's tracked files with the fixture on top.

### Update the site template

Run these in `packages/site-template`:

1. Run `npx nimbus-docs outdated` to see which components and starter files fell behind.
2. Run `npm run components -- --overwrite` to bring every registry component up to date. Without `--overwrite`, it adds the components the template lacks. It skips Nimbus features, which are agent hand-offs, not components.
3. Run `npx nimbus-docs migrate` to apply API migrations between Nimbus versions.
4. Bump the dependencies in `package.json` and run `npm install`.
5. Add any new component meant for page content to `src/components.ts`.
6. Run `apps/builder/scripts/verify.sh` and `vp run test`.

Existing docs keep the template they started from. The image's `node_modules` come from the new `package-lock.json`, so a doc whose `package.json` asks for other versions still builds against the image's.

## UI

Shared shadcn/ui components live in `packages/ui`. Design tokens are in `packages/ui/src/styles/globals.css`.

```bash
npx shadcn@latest add dialog popover -c packages/ui
```

```tsx
import { Button } from "@shiru/ui/components/button";
```

Run the shadcn CLI from `apps/dashboard` for app-specific blocks.

## Deployment

Maintainers release with the **Release** workflow (`.github/workflows/release.yml`), started by hand from `main` with a patch, minor or major bump. It runs CI, applies pending D1 migrations, deploys the Workers, then tags the commit and publishes GitHub release notes. The Workers are:

- `shiru-api` serves `api.shiru.sh`.
- `shiru-dashboard` serves `app.shiru.sh`.
- `shiru-site` serves `shiru.sh`.
- `shiru-dispatch` serves every hostname on the `shiru.page` zone, including custom domains.

Custom domains also need the `shiru.page` zone's fallback origin, `cname.shiru.page`, which is the target customers' CNAMEs point at. Cloudflare activates a fallback origin only when it has its own proxied record, and the `*.shiru.page` wildcard does not count, so the zone keeps a proxied `AAAA` record for `cname.shiru.page` pointing at `100::`. Until the fallback origin is active, every custom hostname stays pending with "fallback origin is not active yet". Check it with `cf custom-hostnames fallback-origin get -z shiru.page`. After fixing it, update the fallback origin again so Cloudflare retries.

The workflow needs three repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `NUCLEO_LICENSE_KEY`.

The API's `BETTER_AUTH_SECRET`, `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `PREVIEW_SECRET`, `DISPATCH_ACCOUNT_ID`, `DISPATCH_API_TOKEN` and `CUSTOM_HOSTNAMES_API_TOKEN` are Worker secrets. Set them with `cf workers secrets update`. Deploys keep them.

- `DISPATCH_ACCOUNT_ID` and `DISPATCH_API_TOKEN` let publishing deploy builds to the `shiru-docs` dispatch namespace. The token needs Workers Scripts Edit on that account.
- `CUSTOM_HOSTNAMES_API_TOKEN` registers custom domains as Cloudflare for SaaS custom hostnames on the `shiru.page` zone.
- `PREVIEW_SECRET` signs the grants that let organization members into previews. `shiru-dispatch` needs the same value as its own `PREVIEW_SECRET` secret.

Development never deploys and uses a fixed preview secret, so local `.env` files leave all of these out except the first three.

To deploy by hand, export `CLOUDFLARE_API_TOKEN`, then run `vp run build` and `vp run deploy`.
