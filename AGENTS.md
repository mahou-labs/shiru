# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project Overview

TypeScript monorepo (Turborepo + pnpm) for an open-source documentation platform (Mintlify alternative):

- **Frontend**: React 19 + TanStack Start (SPA) + TailwindCSS v4
- **Backend**: Hono + oRPC (type-safe APIs) + Better Auth
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **UI Package**: Base UI + CVA + Tailwind Merge

## Build & Development Commands

```bash
pnpm install                   # Install dependencies
pnpm dev                       # Start all services (dashboard:3001, api:3000, db studio)
pnpm dev:dashboard             # Start frontend only
pnpm dev:api                   # Start API only
pnpm lint                      # Run OxLint across all apps
pnpm format                    # Run OxFmt across all apps
pnpm typecheck                 # TypeScript type checking
pnpm build                     # Build all apps for production

# Database
pnpm db:push                   # Push schema changes (development)
pnpm db:generate               # Generate migrations
pnpm db:migrate                # Run migrations (production)
pnpm db:studio                 # Open Drizzle Studio

# Run commands in specific apps
turbo -F api <command>         # Run in API app
turbo -F dashboard <command>   # Run in dashboard app
turbo -F @shiru/ui <command>   # Run in UI package
```

### Testing

Testing libraries installed but no tests exist yet. `@testing-library/react`, `jsdom` available in dashboard app. No test runner configured - will need vitest setup.

## Code Style Guidelines

### React Compiler

This project uses the React Compiler. **Never use `useMemo`, `useCallback`, or `React.memo`** — the compiler handles memoization automatically. Plain functions and values are fine.

### Comments

Do not add unnecessary or obvious comments to code. Code should be self-documenting. Avoid section dividers (`// ---- section ----`), JSDoc on internal functions, and comments that restate what the code does. Only add comments when the *why* is non-obvious.

### Linting & Formatting

- **Linter**: OxLint (not ESLint) - config in `.oxlintrc.jsonc`
- **Formatter**: OxFmt (not Prettier) - config in `.oxfmtrc.jsonc`
- Type-aware linting enabled: `oxlint --type-aware`
- Ignore patterns: `**/*.gen.ts` (generated files like `routeTree.gen.ts`)

### TypeScript Configuration

- Target: ESNext with bundler module resolution
- Strict mode enabled with additional checks:
  - `noUncheckedIndexedAccess`: Array/object index access returns `T | undefined`
  - `noImplicitOverride`: Require `override` keyword
  - `noFallthroughCasesInSwitch`: Prevent switch fallthrough
  - `verbatimModuleSyntax`: Explicit `type` imports required
- Path aliases: `@/*` maps to `./src/*` in each app

### Import Organization

```typescript
// 1. External packages (alphabetical)
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IconBriefcaseOutlineDuo18, IconCirclePlusOutlineDuo18 } from "nucleo-ui-outline-duo-18";

// 2. Internal monorepo packages
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardHeader } from "@shiru/ui/card";

// 3. Local aliases (@/)
import { Page } from "@/components/page";
import { orpc } from "@/utils/orpc-client";

// 4. Relative imports
import { protectedProcedure } from "../utils/orpc";
```

### Naming Conventions

| Type                | Convention      | Example                              |
| ------------------- | --------------- | ------------------------------------ |
| Files               | kebab-case      | `job-router.ts`, `org-menu.tsx`      |
| Components          | PascalCase      | `JobsRoute`, `EmptyMedia`            |
| Types/Interfaces    | PascalCase      | `EmploymentType`, `RouterAppContext` |
| Functions/Variables | camelCase       | `formatSalary`, `jobsData`           |
| Constants (maps)    | camelCase       | `employmentTypeLabels`               |
| Database tables     | snake_case      | `organization_id`, `created_at`      |
| Route components    | `*Route` suffix | `JobsRoute`, `SettingsRoute`         |

### Error Handling

Use the `tryCatch` utility (Result pattern) with `ORPCError`:

```typescript
import { tryCatch } from "@/utils/try-catch";
import { ORPCError } from "@orpc/server";

const { data, error } = await tryCatch(db.select().from(table));
if (error) {
  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Failed to fetch data",
    cause: error,
  });
}
```

Error codes: `UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`

### API Development (oRPC)

Routes in `apps/api/src/routers/`. Use `protectedProcedure` for authenticated routes:

```typescript
import { protectedProcedure, publicProcedure } from "@/utils/orpc";
import { z } from "zod";

export const myRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    // context.user, context.session available
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .handler(async ({ input, context }) => { ... }),
};
```

### Database Schema (Drizzle)

Tables in `apps/api/src/schema/`. Use UUIDv7 for IDs, snake_case for columns:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v7 as randomUUIDv7 } from "uuid";

export const myTable = sqliteTable("my_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
```

### Frontend Routes (TanStack Start)

File-based routing in `apps/dashboard/src/routes/`. `_app/` prefix = protected routes:

```typescript
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc-client";

export const Route = createFileRoute("/_app/jobs/")({
  component: JobsRoute,
});

function JobsRoute() {
  const jobs = useQuery(orpc.job.list.queryOptions());
  // ...
}
```

### UI Components

Import from `@shiru/ui/<component>`. Button uses `render` prop (not `asChild`):

```typescript
import { Button } from "@shiru/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shiru/ui/card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@shiru/ui/empty";

// Link as button
<Button render={<Link to="/jobs/new" />}>Create Job</Button>

// Icon button
<Button size="icon" variant="ghost"><IconGearOutlineDuo18 /></Button>
```

Use `cn()` for class merging, CVA for component variants. Icons from `nucleo-ui-outline-duo-18`.

## Project Structure

```
shiru/
├── apps/
│   ├── api/              # Hono backend (port 3000)
│   │   └── src/
│   │       ├── routers/  # oRPC route handlers
│   │       ├── schema/   # Drizzle table definitions
│   │       └── utils/    # Auth, DB, procedures, tryCatch
│   ├── dashboard/        # TanStack Start frontend (port 3001)
│   │   └── src/
│   │       ├── routes/   # File-based routing (_app/ = protected)
│   │       ├── components/
│   │       └── utils/    # oRPC client, auth client
│   ├── docs/             # Astro Starlight documentation
│   └── site/             # Marketing site
├── packages/
│   └── ui/               # Shared UI components (@shiru/ui)
│       └── src/components/
└── [config files]
```

## Key Libraries

| Purpose       | Library                          |
| ------------- | -------------------------------- |
| API Framework | Hono                             |
| Type-safe RPC | oRPC                             |
| Auth          | Better Auth                      |
| Database ORM  | Drizzle                          |
| Frontend      | TanStack Start/Router/Query/Form |
| UI Base       | Base UI React                    |
| Styling       | Tailwind v4 + CVA                |
| Validation    | Zod v4                           |
| Icons         | nucleo-ui-outline-duo-18         |

## Design Context

### Users

Solo/indie developers and startup teams (2-20 people), both technical and
non-technical. They're building products and need documentation that works for
humans and AI agents. Context: fast-moving, time-constrained, want to write
docs once and have them just work.

### Brand Personality

Approachable + Confident + Premium. Think Stripe's polish with Notion's warmth.
Not cold or intimidating, but not playful/casual either. The interface should
feel like a tool made by people who care deeply about craft.

Three words: Considered. Warm. Sharp.

### Aesthetic Direction

Evolving toward a cohesive identity across marketing site and dashboard.
References: Mintlify (competitor to beat on polish), Linear/Vercel (design
precision). Anti-references: generic SaaS admin panels, AI-generated dark
landing pages, template-driven design.

Light mode as default. Dark mode as a first-class alternative, not the
personality driver.

### Brand Color

**Cyan** — OKLCH hue 205, blue-leaning cyan. Distinct from Mintlify (green),
Linear (purple), GitBook/ReadMe (blue). Professional yet distinctive.

Token reference (dashboard `index.css`):

- Light primary: `oklch(52% 0.15 205)`
- Dark primary: `oklch(75% 0.13 205)`
- Neutral tint: all grays carry hue 205 at low chroma (0.01-0.02)
- Surfaces: background `oklch(97% 0.012 205)`, sidebar `oklch(95% 0.015 205)`

### Typography

**Geist** (by Vercel) for all text. Loaded from Google Fonts.

- `--font-sans` / `--font-heading`: Geist
- `--font-mono`: Geist Mono
- Heading differentiation via weight (600-700) and size, not a second font family.

### Design Principles

1. **Content is the product** — The editor and documentation are the core
   experience. Every UI decision should make writing and reading better.
2. **Earned complexity** — Start simple, reveal depth through interaction.
   Non-technical users should never feel overwhelmed.
3. **Identity through restraint** — One strong brand color, one distinctive
   typeface, consistent spacing. Personality comes from precision, not effects.
4. **States are experiences** — Empty, loading, error, and success states are
   design opportunities, not afterthoughts.
5. **Both audiences, one voice** — Technical enough for developers, clear
   enough for everyone else.

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "Vite+ dev workflow, builds, and CLI operations (vp dev, vp build, vp check)"
  load: "node_modules/vite-plus/skills/vite-plus/SKILL.md"
- task: "React live queries, data hooks (useLiveQuery, useLiveSuspenseQuery, useLiveInfiniteQuery)"
  load: "apps/dashboard/node_modules/@tanstack/react-db/skills/react-db/SKILL.md"
- task: "TanStack DB collections, optimistic mutations, query builder, and data sync"
  load: "node_modules/.pnpm/@tanstack+db@0.5.33_typescript@5.9.3/node_modules/@tanstack/db/skills/db-core/SKILL.md"
- task: "Devtools Vite plugin configuration (source inspection, console piping, editor integration)"
  load: "apps/dashboard/node_modules/@tanstack/devtools-vite/skills/devtools-vite-plugin/SKILL.md"
- task: "Devtools setup, plugin registration, and framework adapter configuration"
load: "node*modules/.pnpm/@tanstack+react-devtools@0.10.0*@types+react-dom@19.2.3_@types+react@19.2.14__@types+re_41629928d1f9c9a97e80206fc73bcd51/node_modules/@tanstack/devtools/skills/devtools-app-setup/SKILL.md"
<!-- intent-skills:end -->
