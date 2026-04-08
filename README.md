<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/site/public/favicon.svg" />
    <source media="(prefers-color-scheme: light)" srcset=".github/logo-dark.svg" />
    <img alt="Shiru" src=".github/logo-dark.svg" width="48" />
  </picture>
</p>

<h1 align="center">Shiru</h1>

Shiru is an open-source alternative to [Mintlify](https://mintlify.com) for building polished, well-structured documentation that works equally well for people reading it and for AI agents consuming it. No vendor lock-in, no per-seat pricing.

## Tech Stack

- **Monorepo**: Turborepo + Bun
- **Frontend**: React 19 + TanStack Router (SPA) + TailwindCSS v4
- **Backend**: Hono + oRPC (type-safe APIs)
- **Auth**: Better Auth (with organization plugin)
- **Database**: Drizzle ORM
- **Billing**: Polar
- **Linting/Formatting**: OxLint + OxFmt
- **UI**: Shared `@shiru/ui` component library (Base UI + CVA)

## Running Locally

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/mahou-labs/shiru.git
cd shiru
vp install
```

2. Start the PostgreSQL database:

```bash
vp run db:start
```

3. Copy the environment files and configure them:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

4. Push the database schema:

```bash
vp run db:push
```

5. Start the development servers:

```bash
vp run dev
```

| App       | URL                                            |
| --------- | ---------------------------------------------- |
| API       | [http://localhost:3000](http://localhost:3000) |
| Dashboard | [http://localhost:3001](http://localhost:3001) |
| Site      | [http://localhost:3002](http://localhost:3002) |
| Docs      | [http://localhost:3003](http://localhost:3003) |

### Useful Commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `vp run dev`       | Start all services                |
| `vp run build`     | Build for production              |
| `vp run check`     | Run format, lint, and type checks |
| `vp run test`      | Run the test suite                |
| `vp run db:studio` | Open Drizzle Studio               |

## Contributors

<a href="https://github.com/mahou-labs/shiru/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mahou-labs/shiru" />
</
