# shiru

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Hono, ORPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **workers** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Vite+** - Unified Vite toolchain, workspace task runner, linting, and formatting

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
pnpm run db:push
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@shiru/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

The backend reads native Worker bindings via `src/env.server.ts`. Bindings are declared in `apps/server/cloudflare.config.ts`; `cf workers types` generates runtime and binding types in `.cloudflare/types`. Local development reads values from `apps/server/.env` (or `.dev.vars`). Varlock schemas remain available for code generation and standalone database tooling; Worker bindings are not validated by Varlock at runtime.

Run standalone Node tools that use Varlock from the owning package directory. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Deployment

### Cloudflare Workers

Requires Node.js 22+ and pnpm. The backend uses the cf CLI and Cloudflare Vite plugin, configured in `apps/server/cloudflare.config.ts` and `apps/server/vite.config.ts`. No Alchemy, Bun executable compilation, or tsdown packaging is needed. `cf deploy` builds the Worker before uploading it.

- Authenticate: `pnpm --filter server exec cf auth login`
- Dev: `pnpm run dev:server`
- Build without deploying: `pnpm --filter server run build`
- Check types: `pnpm --filter server run check-types`
- Deploy using existing uploaded secrets: `pnpm run deploy`

For the first deployment, create an ignored `apps/server/.env.production` file containing all six bindings declared in `cloudflare.config.ts`, then upload them with the deployment:

```bash
pnpm --filter server exec cf deploy --secrets-file .env.production
```

### Production origins

- Set production `CORS_ORIGIN` to the exact deployed web origin, such as `https://app.example.com`, and `BETTER_AUTH_URL` to the deployed backend origin. Unlike Alchemy, cf does not automatically populate the auth URL. Keep localhost values in `.env` for local development.
- Update production values with `cf deploy --secrets-file .env.production` from `apps/server`; a normal deployment does not upload local `.env` values.

### Frontend on Cloudflare Workers

The React frontend deploys as static assets (no server-side Worker code), using `apps/web/cloudflare.config.ts` and the Cloudflare Vite plugin. SPA fallback serves `index.html` for client-side routes such as `/dashboard`.

- Dev: `pnpm run dev:web`
- Build without deploying: `pnpm --filter web run build`
- Deploy: `pnpm run deploy:web`
- Deploy the backend separately: `pnpm run deploy:server` (`pnpm run deploy` also remains backend-only)

Set `VITE_SERVER_URL` to the deployed backend origin in an ignored `apps/web/.env.production` file before building or deploying. Varlock validates the public frontend environment at build time; this URL is embedded in the browser bundle, not supplied as a runtime Worker secret. Rebuild and redeploy when it changes. Keep the local backend URL in `apps/web/.env`, and update the backend's production `CORS_ORIGIN` to the deployed frontend origin.

## Git Hooks and Formatting

- Optional native Vite+ hooks: `pnpm run hooks:setup`
- Docs: [Vite+ commit hooks](https://viteplus.dev/guide/commit-hooks)
- Run checks: `pnpm run check`

## Project Structure

```
shiru/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run check`: Run Vite+ format/lint checks and workspace TypeScript checks
- `pnpm run lint`: Run Vite+ lint checks
- `pnpm run format`: Run Vite+ formatting
- `pnpm run staged`: Run Vite+ checks against staged files
- `pnpm run hooks:setup`: Install Vite+ native Git hooks with `vp config`
