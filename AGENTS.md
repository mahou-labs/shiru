# shiru

## Tests are part of every API change

Every new feature or bug fix in `apps/api` ships with tests in the same change. `vp run test` runs them with coverage, and CI fails when coverage drops below the thresholds in `apps/api/vite.config.ts`. Do not lower the thresholds to make a change pass. Add the missing tests.

Write tests the way a caller uses the API:

- Put them next to the code as `*.test.ts`.
- Drive the real app through `createClient()` from `src/test/client.ts`. It sends requests to the Hono app with the dashboard's `Origin` and a cookie jar. `signUpVerified()` and `createOrganization()` cover the usual setup.
- Assert literal values: status codes, response bodies, typed error codes. A test that would still pass if the code returned `undefined` is not a test.
- For a procedure that has no route yet, attach a handler and run it with `call()` from `@orpc/server`, as `src/utils/orpc.test.ts` does for `paidProcedure`.
- Pin time with `vi.useFakeTimers({ toFake: ["Date"] })` and `vi.setSystemTime()` when results depend on dates.

`src/test/setup.ts` swaps three things, and nothing else should be mocked:

- `cloudflare:workers` becomes the bindings in `src/test/bindings.ts`. Sent emails land in `sentEmails`, and `waitUntil` work is awaited after each request. `ARTIFACTS` is an in-memory namespace with the binding's read API; `artifacts.receive()` stands in for an accepted push. `DOCS` runs the real `Doc` class on node:sqlite, one instance per name, behind a stub that clones arguments and results like RPC. Publishing pushes over HTTP and starts a Workflow, so it is covered by `scripts/verify-publish.ts` under `cf dev`, not here.
- `src/utils/db.ts` becomes an in-memory SQLite database with the tables from `src/schema`, created with drizzle-kit the way `db:push` creates them. Each test file gets a fresh database, so use unique emails within a file.
- `@polar-sh/sdk/2026-10` keeps the real SDK, but `createPolarCore` sends its HTTP requests to `polarApi`, an in-memory Polar API in `src/test/bindings.ts`. What Polar received is in `polarCustomers` and `polarCheckouts`, in Polar's snake_case wire shape. A route the fake lacks answers 501.

Better Auth skips its origin (CSRF) check when `NODE_ENV` is `test`, so origin rejection cannot be tested here. Use the `verify-shiru` skill for checks that need the real server or a browser.

## Inspecting local Cloudflare resources

While the API dev server is running (`vp run dev` in `apps/api`), the Cloudflare Local Explorer exposes the local bindings (D1, KV, R2, Durable Objects, Workflows) at `http://localhost:3000/cdn-cgi/local/explorer/api`. Fetch that URL to get the OpenAPI schema, then use its endpoints to list and query local resources. The same database backs the user's own dev server, so read from it freely but do not write to it unless asked. Emails sent through the simulated `EMAIL` binding show up in the Explorer UI at `http://localhost:3000/cdn-cgi/local/explorer`.

## Commits

Commit your changes with the `git` or `gh` CLI under the user's configured git identity. Start every commit message with a lowercase letter and an imperative verb, like `add rate limiting to the api`. Commit only the files you changed and leave the user's other pending edits alone.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
